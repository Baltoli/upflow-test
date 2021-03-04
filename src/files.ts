import fs from 'fs';
import {access, mkdir} from 'fs/promises';
import http from 'http';
import path from 'path';
import {fromPath} from 'pdf2pic';

export const downloadDirectory = 'data';

let uniqueSuffix = 0;

async function getUniquePath(hint: string): Promise<string> {
  try {
    await access(hint);

    const dir = path.dirname(hint);
    const ext = path.extname(hint);
    const base = path.basename(hint, ext);

    const unique = path.join(dir, `${base}_${uniqueSuffix}${ext}`);
    uniqueSuffix += 1;

    return getUniquePath(unique);
  } catch {
    return hint;
  }
}

export async function createDownloadDirectory() {
  return await mkdir(downloadDirectory, {recursive: true});
}

export async function downloadPDF(url: string): Promise<string> {
  const pathHint = path.join('.', downloadDirectory, path.basename(url));
  const absolutePath = await getUniquePath(path.resolve(pathHint));

  return new Promise<string>((resolve, reject) => {
    http.get(url, async (res) => {
      const outFile = await fs.createWriteStream(absolutePath);
      res.pipe(outFile);

      res.on('close', () => resolve(absolutePath));
    });
  });
}

export async function createThumbnail(file: string): Promise<string> {
  const format = 'png';
  const page = 1;

  const dir = path.dirname(file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);

  const uniqueOut =
      await getUniquePath(path.join(dir, `${base}.${page}.${format}`));

  const options = {
    density: 100,
    saveFilename: path.basename(uniqueOut, `.${page}.${format}`),
    savePath: dir,
    width: 210,
    height: 297,
    format: format
  };

  await fromPath(file, options)(page);

  return uniqueOut;
}
