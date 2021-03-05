import express from 'express';

import {Document, Upload} from './database';
import * as routes from './routes';

/*
 * Ensures that database tables are created and synced before setting up request
 * middleware and application routes.
 */
function initialiseApp() {
  Upload.sync();
  Document.sync();

  const app = express();
  app.use(express.json());

  app.post('/upload', routes.submitURL);
  app.get('/uploads', routes.listUploads);

  app.get('/uploads/:id/pdf', routes.keyFromUploadWithID('pdf'));
  app.get('/uploads/:id/image', routes.keyFromUploadWithID('thumbnail'));

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
