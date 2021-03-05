import fastqueue from 'fastq';
import fetch from 'node-fetch';

import {Document, Upload} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer} from './files';

export interface UploadTask {
  url: string;
  host?: string;
  hook?: string;
}

async function documentWorker(
    arg: UploadTask, callback: fastqueue.done<Upload>) {
  const buffer = await downloadPDF(arg.url);

  const hash = hashPDFBuffer(buffer);

  const [doc] = await Document.findOrCreate({
    where: {hash},
    defaults: {pdf: buffer, thumbnail: await createThumbnail(buffer), hash}
  });

  const newUpload = await Upload.create({documentId: doc.id});

  if (arg.hook) {
    await fetch(arg.hook + '/success', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({document: newUpload.render(arg.host)})
    });
  }

  callback(null, newUpload);
}

export const documentQueue = fastqueue(documentWorker, 1);
