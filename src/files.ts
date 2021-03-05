import crypto from 'crypto';
import {readFile} from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import {fromBuffer} from 'pdf2pic';
import tempy from 'tempy';

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  return res.buffer();
}

export function hashBuffer(data: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/*
 * Create a small PNG thumbnail from the first page of a PDF document.
 *
 * At the moment, the encoding settings for this process are hard-coded to
 * produce a 100 DPI image with the aspect ratio of a portrait A4 document. It's
 * possible in theory to work out the size of a PDF page, but it requires poking
 * around in arcane metadata.
 *
 * Because the PDF rendering process shells out to GraphicsMagick internally, we
 * need to write a temporary file to make the thumbnail. This gets deleted after
 * we've read it back into a buffer. It would be ideal to do this entirely
 * in-memory in an improved version.
 */
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
