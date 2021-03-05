import express from 'express';

import {Upload} from './database';
import {createDownloadDirectory} from './files';

import * as routes from './routes';

function initialiseApp() {
  Upload.sync();
  createDownloadDirectory();

  const app = express();
  app.use(express.json());

  app.post('/submit', routes.submitURL);
  app.get('/list', routes.listAll);

  app.get('/pdf/:id', routes.keyFromUploadWithID('pdf'));
  app.get('/image/:id', routes.keyFromUploadWithID('thumbnail'));

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
