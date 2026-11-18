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
import { User } from './User';

/** Estante favoritada: `UserId` favorita a estante do dono `ShelfOwnerId`. */
export class FavoriteShelf extends Model<
    InferAttributes<FavoriteShelf>,
    InferCreationAttributes<FavoriteShelf>
> {
    declare Id: CreationOptional<number>;
    declare Uuid: CreationOptional<string>;
    declare UserId: ForeignKey<User['Id']>;
    declare ShelfOwnerId: ForeignKey<User['Id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare User?: NonAttribute<User>;
    declare ShelfOwner?: NonAttribute<User>;
}

FavoriteShelf.init(
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
        ShelfOwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'Id' },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'FavoriteShelves',
        indexes: [
            {
                unique: true,
                fields: ['UserId', 'ShelfOwnerId'],
            },
        ],
    },
);

FavoriteShelf.belongsTo(User, { foreignKey: 'UserId', as: 'User' });
FavoriteShelf.belongsTo(User, { foreignKey: 'ShelfOwnerId', as: 'ShelfOwner' });
User.hasMany(FavoriteShelf, { foreignKey: 'UserId', as: 'FavoriteShelfRelations' });
