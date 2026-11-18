import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../database';

export class BookCopy extends Model<
    InferAttributes<BookCopy>,
    InferCreationAttributes<BookCopy>
> {
    declare Id: CreationOptional<number>;
    declare Uuid: CreationOptional<string>;
    declare ISBN: CreationOptional<string | null>;
    declare Editora: string;
    declare TypePrint: string;
    declare PublicationDate: Date;
    declare PublicationLocality: CreationOptional<string | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

BookCopy.init(
    {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        ISBN: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Editora: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        TypePrint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        PublicationDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        PublicationLocality: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'BookCopies',
    },
);
