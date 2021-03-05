import crypto from 'crypto';
import {readFile} from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import {fromBuffer} from 'pdf2pic';
import tempy from 'tempy';

export async function downloadPDF(url: string): Promise<Buffer> {
  const res = await fetch(url);
  return res.buffer();
}

export function hashPDFBuffer(data: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

export async function createThumbnail(file: Buffer): Promise<Buffer> {
  const format = 'png';
  const page = 1;

  return await tempy.directory.task(async (tmp) => {
    const options = {
      density: 100,
      saveFilename: 'out',
      savePath: tmp,
      width: 210,
      height: 297,
      format: format
    };

    await fromBuffer(file, options)(page);

    const outputPath = path.join(tmp, `out.${page}.${format}`);
    return await readFile(outputPath);
  });
}
