import {DataTypes, Model, Optional, Sequelize} from 'sequelize';

const connection = new Sequelize('sqlite:upflow.db');

export interface UploadResource {
  pdf: string;
  thumbnail: string;
}

interface IUpload {
  id: number;
  pdf: string;
  thumbnail: string;
  hash: string;
}

interface IUploadCreate extends Optional<IUpload, 'id'> {}

export class Upload extends Model<IUpload, IUploadCreate> implements IUpload {
  public id!: number;
  public pdf!: string;
  public thumbnail!: string;
  public hash!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
      pdf: {type: DataTypes.STRING, allowNull: false},
      thumbnail: {type: DataTypes.STRING, allowNull: false},
      hash: {type: DataTypes.STRING, allowNull: false}
    },
    {sequelize: connection, modelName: 'upload'});
