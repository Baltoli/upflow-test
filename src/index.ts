import express from 'express';

import {allEntries, insertEntry, openDatabase} from './database';

openDatabase();

const app = express();
const port = 3000;

app.post('/submit', (req, res) => {});

app.get('/list', async (req, res) => {
  const entries = await allEntries();
  res.send(entries);
});

app.get('/image/:id', (req, res) => {});

app.get('/pdf/:id', (req, res) => {});

app.listen(port, () => {
  console.log(`PDF submission app listening on port: ${port}`);
});
