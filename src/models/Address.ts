import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../database';

export class Address extends Model<
    InferAttributes<Address>,
    InferCreationAttributes<Address>
> {
    declare Id: CreationOptional<number>;
    declare Rua: string;
    declare Numero: string;
    declare Complemento: string;
    declare Bairro: string;
    declare Cep: number;
    declare Cidade: string;
    declare Estado: string;
    declare Pais: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Address.init(
    {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Rua: { type: DataTypes.STRING, allowNull: false },
        Numero: { type: DataTypes.STRING, allowNull: false },
        Complemento: { type: DataTypes.STRING, allowNull: false },
        Bairro: { type: DataTypes.STRING, allowNull: false },
        Cep: { type: DataTypes.INTEGER, allowNull: false },
        Cidade: { type: DataTypes.STRING, allowNull: false },
        Estado: { type: DataTypes.STRING, allowNull: false },
        Pais: { type: DataTypes.STRING, allowNull: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Addresses',
    },
);
