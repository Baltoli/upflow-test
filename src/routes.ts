import {Request, Response} from 'express';
import fetch from 'node-fetch';

import {Upload} from './database';
import {submitTask} from './queue';

export function submitURL(req: Request, res: Response): void {
  submitTask({url: req.body.url}, async (err, newUpload) => {
    if (req.body.hook) {
      const endpoint = err ? '/error' : '/success';
      const body = err ? {error: err.message} :
                         {document: newUpload?.render(req.headers.host)};

      try {
        await fetch(req.body.hook + endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    }
  });

  res.status(200).end();
}

export async function listAll(req: Request, res: Response): Promise<void> {
  const rawUploads = await Upload.findAll();
  const documents = rawUploads.map(d => d.render(req.headers.host));
  res.status(200).json({documents});
}

type UploadFileKey = 'pdf'|'thumbnail';

export function keyFromUploadWithID(key: UploadFileKey):
    ((req: Request, res: Response) => Promise<void>) {
  return async (req, res) => {
    const upload = await Upload.findByPk(
        req.params.id, {include: [Upload.associations.document]});

    if (upload === null || upload.document === null) {
      res.status(404).end();
    } else {
      res.status(200).end(upload.document[key]);
    }
  };
}
