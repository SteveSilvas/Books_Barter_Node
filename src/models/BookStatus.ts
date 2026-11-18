import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../database';

/** Situação de um livro na estante do dono. */
export type BookStatusName = 'available' | 'reserved' | 'traded';

export class BookStatus extends Model<
    InferAttributes<BookStatus>,
    InferCreationAttributes<BookStatus>
> {
    declare Id: CreationOptional<number>;
    declare Name: BookStatusName;
    declare Description: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

BookStatus.init(
    {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'BookStatuses',
    },
);

/** Status semeados no banco (idempotente). */
export const BOOK_STATUS_SEED: Array<{
    Name: BookStatusName;
    Description: string;
}> = [
    { Name: 'available', Description: 'Disponível' },
    { Name: 'reserved', Description: 'Reservado para troca' },
    { Name: 'traded', Description: 'Trocado' },
];
