import fastqueue from 'fastq';

import {Document} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer, writePDFBufferToFile} from './files';

async function documentWorker(arg: string, callback: any) {
  const buffer = await downloadPDF(arg);

  const path = await writePDFBufferToFile(buffer, arg);
  const thumbPath = await createThumbnail(path);

  const hash = hashPDFBuffer(buffer);

  const newDoc =
      await Document.create({pdf: path, thumbnail: thumbPath, hash: hash});

  callback(null, {path, thumbPath});
}

export const documentQueue = fastqueue(documentWorker, 1);
