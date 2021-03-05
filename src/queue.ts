import fastqueue from 'fastq';

import {Document, Upload} from './database';
import {createThumbnail, downloadToBuffer, hashBuffer} from './files';

export interface UploadTask {
  url: string;
}

/*
 * The core work performed by the application - downloads the contents of a URL
 * to a buffer, hashes it, then creates a thumbnail. If the hash already exists
 * in the database, then the existing document is looked up; otherwise a new one
 * is created. The supplied callback is called with the newly saved Upload model
 * on success.
 */
async function documentWorker(
    arg: UploadTask, callback: fastqueue.done<Upload>): Promise<void> {
  try {
    const buffer = await downloadToBuffer(arg.url);
    const hash = hashBuffer(buffer);

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

/*
 * External interface to the work queue - as implemented it just passes its
 * arguments through to the queue, but in a larger system it might also store
 * tasks in a database table as well (for example), so the cleaner abstract
 * interface is useful.
 */
export function submitTask(
    task: UploadTask, callback: fastqueue.done<Upload>): void {
  documentQueue.push(task, callback);
}
