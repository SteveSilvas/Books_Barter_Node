import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from 'sequelize';
import { sequelize } from '../database';
import { Category } from './Category';

export class Book extends Model<
    InferAttributes<Book>,
    InferCreationAttributes<Book>
> {
    declare Id: CreationOptional<number>;
    declare Title: string;
    declare Autor: string;
    declare CategoryId: ForeignKey<Category['Id']>;
    declare CreationDate: CreationOptional<Date | null>;
    declare CreationLocality: CreationOptional<string | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare Category?: NonAttribute<Category>;
}

Book.init(
    {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Autor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Category, key: 'Id' },
        },
        CreationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CreationLocality: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Books',
    },
);

Book.belongsTo(Category, { foreignKey: 'CategoryId', as: 'Category' });
Category.hasMany(Book, { foreignKey: 'CategoryId', as: 'Books' });
