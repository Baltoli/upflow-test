import fastqueue from 'fastq';

import {Document} from './database';
import {createThumbnail, downloadPDF, writePDFBufferToFile} from './files';

async function documentWorker(arg: string, callback: any) {
  const buffer = await downloadPDF(arg);
  const path = await writePDFBufferToFile(buffer, arg);
  const thumbPath = await createThumbnail(path);

  const newDoc = await Document.create({pdf: path, thumbnail: thumbPath});

  callback(null, {path, thumbPath});
}

export const documentQueue = fastqueue(documentWorker, 1);
