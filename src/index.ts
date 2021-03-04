import express from 'express';

import {Document} from './database';
import {createDownloadDirectory} from './files';

import * as routes from './routes';

function initialiseApp() {
  Document.sync();
  createDownloadDirectory();

  const app = express();
  app.use(express.json());

  app.post('/submit', routes.submitURL);
  app.get('/list', routes.listAll);

  app.get('/pdf/:id', routes.keyFromDocumentWithID('pdf'));
  app.get('/image/:id', routes.keyFromDocumentWithID('thumbnail'));

  return app;
}

function run() {
  const port = 3000;
  const app = initialiseApp();

  app.listen(port, () => {
    console.log(`PDF submission app listening on port: ${port}`);
  });
}

run();
