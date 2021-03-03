import express from 'express';

const app = express();
const port = 3000;

app.post('/submit', (req, res) => {});

app.get('/list', (req, res) => {});

app.get('/image/:id', (req, res) => {});

app.get('/pdf/:id', (req, res) => {});

app.listen(port, () => {
  console.log(`PDF submission app listening on port: ${port}`);
});
