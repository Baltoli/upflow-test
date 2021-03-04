import express from 'express';
import fastqueue from 'fastq';

import {Document} from './database';
import {createDownloadDirectory, createThumbnail, downloadPDF} from './files';

createDownloadDirectory();

const app = express();
const port = 3000;

async function queueWorker(arg: string, callback: any) {
  await Document.sync();

  const path = await downloadPDF(arg);
  const thumbPath = await createThumbnail(path);

  const newDoc = await Document.create({pdf: path, thumbnail: thumbPath});

  callback(null, {path, thumbPath});
}

const queue = fastqueue(queueWorker, 1);

app.use(express.json());

app.post('/submit', async (req, res) => {
  queue.push(req.body.url);
  res.status(200).end();
});

app.get('/list', async (req, res) => {
  const docs = await Document.findAll();
  res.status(200).json({documents: docs.map(d => d.render(req.headers.host))});
});

app.get('/image/:id', async (req, res) => {
  const doc = await Document.findByPk(req.params.id);

  if (doc === null) {
    res.status(404).end();
  } else {
    res.status(200).sendFile(doc.thumbnail);
  }
});

app.get('/pdf/:id', async (req, res) => {
  const doc = await Document.findByPk(req.params.id);

  if (doc === null) {
    res.status(404).end();
  } else {
    res.status(200).sendFile(doc.pdf);
  }
});

app.listen(port, () => {
  console.log(`PDF submission app listening on port: ${port}`);
});
