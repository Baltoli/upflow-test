import fastqueue from 'fastq';

import {Document} from './database';
import {createThumbnail, downloadPDF, hashPDFBuffer, writePDFBufferToFile} from './files';

async function documentWorker(arg: string, callback: any) {
  const buffer = await downloadPDF(arg);

  const hash = hashPDFBuffer(buffer);

  const existing = await Document.findOne({where: {hash: hash}});
  if (existing === null) {
    const path = await writePDFBufferToFile(buffer, arg);
    const thumbPath = await createThumbnail(path);

    await Document.create({pdf: path, thumbnail: thumbPath, hash: hash});
  } else {
    await Document.create(
        {pdf: existing.pdf, thumbnail: existing.thumbnail, hash: hash});
  }

  callback(null, {});
}

export const documentQueue = fastqueue(documentWorker, 1);
