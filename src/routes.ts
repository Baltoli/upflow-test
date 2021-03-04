import {Request, Response} from 'express';

import {Document} from './database';
import {documentQueue} from './queue';

export async function submitURL(req: Request, res: Response) {
  documentQueue.push(req.body.url);
  res.status(200).end();
}

export async function listAll(req: Request, res: Response) {
  const rawDocuments = await Document.findAll();
  const documents = rawDocuments.map(d => d.render(req.headers.host));
  res.status(200).json({documents});
}

type DocumentFileKey = 'pdf'|'thumbnail';

export function keyFromDocumentWithID(key: DocumentFileKey) {
  return async (req: Request, res: Response) => {
    const doc = await Document.findByPk(req.params.id);

    if (doc === null) {
      res.status(404).end();
    } else {
      res.status(200).sendFile(doc[key]);
    }
  };
}
