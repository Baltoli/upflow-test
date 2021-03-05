import fastqueue from 'fastq';
import fetch from 'node-fetch';

import {Document, Upload} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer} from './files';

export interface UploadTask {
  url: string;
}

async function documentWorker(
    arg: UploadTask, callback: fastqueue.done<Upload>) {
  try {
    const buffer = await downloadPDF(arg.url);

    const hash = hashPDFBuffer(buffer);

    const [doc] = await Document.findOrCreate({
      where: {hash},
      defaults: {pdf: buffer, thumbnail: await createThumbnail(buffer), hash}
    });

    const newUpload = await Upload.create({documentId: doc.id});

    callback(null, newUpload);
  } catch (err) {
    callback(err);
  }
}

const documentQueue = fastqueue(documentWorker, 1);

export function submitTask(task: UploadTask, callback: fastqueue.done<Upload>) {
  documentQueue.push(task, callback);
}
