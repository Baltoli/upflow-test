import fastqueue from 'fastq';
import fetch from 'node-fetch';

import {Document, Upload} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer} from './files';

export interface UploadTask {
  url: string;
  host?: string;
  hook?: string;
}

async function documentWorker(arg: UploadTask) {
  const buffer = await downloadPDF(arg.url);

  const hash = hashPDFBuffer(buffer);

  const createdDoc = await Document.findOrCreate({
    where: {hash},
    defaults: {pdf: buffer, thumbnail: await createThumbnail(buffer), hash}
  });

  // const existing = await Document.findOne({where: {hash: hash}});
  // if (existing === null) {
  //   const path = await writePDFBufferToFile(buffer, arg.url);
  //   const thumbnail = await createThumbnail(path);

  //   createdDoc = await Document.create({pdf: buffer, thumbnail, hash});
  // } else {
  //   //   createdDoc = await Upload.create(
  //   //       {pdf: existing.pdf, thumbnail: existing.thumbnail, hash:
  //   hash});
  // }

  // if (arg.hook) {
  //   await fetch(arg.hook + '/success', {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: JSON.stringify({document: createdDoc.render(arg.host)})
  //   });
  // }
}

export const documentQueue = fastqueue(documentWorker, 1);
