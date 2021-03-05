import {Association, DataTypes, Model, Optional, Sequelize} from 'sequelize';

const connection = new Sequelize('sqlite:upflow.db');

/*
 * The Document model represents an uploaded PDF with its generated thumbnail,
 * both of which are stored as binary blobs in the database.
 *
 * A hash of the PDF content is also stored; this allows for duplicates to be
 * detected on document upload (though this invariant is not checked at the
 * database level, nor is the provenance of the hash checked).
 */

interface IDocument {
  id: number;
  pdf: Buffer;
  thumbnail: Buffer;
  hash: string;
}

interface IDocumentCreate extends Optional<IDocument, 'id'> {}

export class Document extends Model<IDocument, IDocumentCreate> implements
    IDocument {
  public id!: number;
  public pdf!: Buffer;
  public thumbnail!: Buffer;
  public hash!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      pdf: {type: DataTypes.BLOB, allowNull: false},
      thumbnail: {type: DataTypes.BLOB, allowNull: false},
      hash: {type: DataTypes.STRING, allowNull: false}
    },
    {sequelize: connection, modelName: 'document'});

/*
 * The Upload model represents the result of a single client request to the
 * /submit endpoint - a fresh instance is always created, even if the linked
 * document already exists in the database.
 */

export interface UploadResource {
  pdf: string;
  thumbnail: string;
}

interface IUpload {
  id: number;
  documentId: number;
}

interface IUploadCreate extends Optional<IUpload, 'id'> {}

export class Upload extends Model<IUpload, IUploadCreate> implements IUpload {
  public id!: number;
  public documentId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly document!: Document;

  public static associations: {document: Association<Upload, Document>;};

  public render(host?: string): UploadResource {
    const hostString = host ? `http://${host}` : '';

    return {
      pdf: `${hostString}/pdf/${this.id}`,
          thumbnail: `${hostString}/image/${this.id}`
    }
  }
}

Upload.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      documentId: {type: DataTypes.INTEGER, allowNull: false}
    },
    {sequelize: connection, modelName: 'upload'});

Upload.belongsTo(Document);
