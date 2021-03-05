import {Request, Response} from 'express';

import {Upload} from './database';
import {documentQueue} from './queue';

export function submitURL(req: Request, res: Response): void {
  documentQueue.push(
      {url: req.body.url, host: req.headers.host, hook: req.body.hook});
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
