import {DataTypes, Model, Optional, Sequelize} from 'sequelize';

const connection = new Sequelize('sqlite:upflow.db');

export interface DocumentResource {
  pdf: string;
  thumbnail: string;
}

interface IDocument {
  id: number;
  pdf: string;
  thumbnail: string;
  hash: string;
}

interface IDocumentCreate extends Optional<IDocument, 'id'> {}

export class Document extends Model<IDocument, IDocumentCreate> implements
    IDocument {
  public id!: number;
  public pdf!: string;
  public thumbnail!: string;
  public hash!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public render(host?: string): DocumentResource {
    const hostString = host ? `http://${host}` : '';

    return {
      pdf: `${hostString}/pdf/${this.id}`,
          thumbnail: `${hostString}/image/${this.id}`
    }
  }
}

Document.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      pdf: {type: DataTypes.STRING, allowNull: false},
      thumbnail: {type: DataTypes.STRING, allowNull: false},
      hash: {type: DataTypes.STRING, allowNull: false}
    },
    {sequelize: connection, modelName: 'document'});
