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
import { BookStatus } from './BookStatus';
import { Category } from './Category';
import { User } from './User';

export class Book extends Model<
    InferAttributes<Book>,
    InferCreationAttributes<Book>
> {
    declare Id: CreationOptional<number>;
    declare Uuid: CreationOptional<string>;
    declare Title: string;
    declare Autor: string;
    declare CategoryId: ForeignKey<Category['Id']>;
    declare UserId: ForeignKey<User['Id']>;
    declare StatusId: ForeignKey<BookStatus['Id']>;
    declare CreationDate: CreationOptional<Date | null>;
    declare CreationLocality: CreationOptional<string | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare Category?: NonAttribute<Category>;
    declare Owner?: NonAttribute<User>;
    declare Status?: NonAttribute<BookStatus>;
}

Book.init(
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
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'Id' },
        },
        StatusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: BookStatus, key: 'Id' },
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

Book.belongsTo(User, { foreignKey: 'UserId', as: 'Owner' });
User.hasMany(Book, { foreignKey: 'UserId', as: 'Books' });

Book.belongsTo(BookStatus, { foreignKey: 'StatusId', as: 'Status' });
BookStatus.hasMany(Book, { foreignKey: 'StatusId', as: 'Books' });
