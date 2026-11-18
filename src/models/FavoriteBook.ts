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
import { Book } from './Book';
import { User } from './User';

/** Livro favoritado: `UserId` favorita o livro `BookId`. */
export class FavoriteBook extends Model<
    InferAttributes<FavoriteBook>,
    InferCreationAttributes<FavoriteBook>
> {
    declare Id: CreationOptional<number>;
    declare Uuid: CreationOptional<string>;
    declare UserId: ForeignKey<User['Id']>;
    declare BookId: ForeignKey<Book['Id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare User?: NonAttribute<User>;
    declare Book?: NonAttribute<Book>;
}

FavoriteBook.init(
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
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'Id' },
        },
        BookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Book, key: 'Id' },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'FavoriteBooks',
        indexes: [
            {
                unique: true,
                fields: ['UserId', 'BookId'],
            },
        ],
    },
);

FavoriteBook.belongsTo(User, { foreignKey: 'UserId', as: 'User' });
FavoriteBook.belongsTo(Book, { foreignKey: 'BookId', as: 'Book' });
User.hasMany(FavoriteBook, { foreignKey: 'UserId', as: 'FavoriteBookRelations' });
Book.hasMany(FavoriteBook, { foreignKey: 'BookId', as: 'FavoriteRelations' });
