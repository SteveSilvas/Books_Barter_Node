import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../database';

export type AuthProvider = 'local' | 'google';

export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare Id: CreationOptional<number>;
    declare Name: string;
    declare Birth: Date | null;
    declare Email: string;
    declare Pass: string | null;
    declare Provider: CreationOptional<AuthProvider>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

User.init(
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
        },
        Birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        Pass: {
            // Nulo para contas criadas via Google (não há senha local).
            type: DataTypes.STRING,
            allowNull: true,
        },
        Provider: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'local',
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Users',
    },
);
