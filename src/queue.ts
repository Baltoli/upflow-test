import fastqueue from 'fastq';
import fetch from 'node-fetch';

import {Document} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer, writePDFBufferToFile} from './files';

export interface DocumentTask {
  url: string;
  host?: string;
  hook?: string;
}

async function documentWorker(arg: DocumentTask, callback: any) {
  const buffer = await downloadPDF(arg.url);

  const hash = hashPDFBuffer(buffer);

  let createdDoc: Document;

  const existing = await Document.findOne({where: {hash: hash}});
  if (existing === null) {
    const path = await writePDFBufferToFile(buffer, arg.url);
    const thumbPath = await createThumbnail(path);

    createdDoc =
        await Document.create({pdf: path, thumbnail: thumbPath, hash: hash});
  } else {
    createdDoc = await Document.create(
        {pdf: existing.pdf, thumbnail: existing.thumbnail, hash: hash});
  }

  if (arg.hook) {
    await fetch(arg.hook + '/success', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({document: createdDoc.render(arg.host)})
    });
  }

  callback(null, {});
}

export const documentQueue = fastqueue(documentWorker, 1);
