import {DataTypes, Model, Optional, Sequelize} from 'sequelize';

const connection = new Sequelize('sqlite:upflow.db');

interface IDocument {
  id: number;
  pdf: string;
  thumbnail: string;
}

interface IDocumentCreate extends Optional<IDocument, 'id'> {}

export class Document extends Model<IDocument, IDocumentCreate> implements
    IDocument {
  public id!: number;
  public pdf!: string;
  public thumbnail!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public downloadLinks() {
    return {
      pdf: `/pdf/${this.id}`, thumbnail: `/image/${this.id}`
    }
  }
}

Document.init(
    {
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
      pdf: {type: DataTypes.STRING, allowNull: false},
      thumbnail: {type: DataTypes.STRING, allowNull: false}
    },
    {sequelize: connection, modelName: 'document'});
