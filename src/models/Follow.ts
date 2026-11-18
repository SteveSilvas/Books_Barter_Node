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

/** Relação de seguir: `FollowerId` passa a seguir `FollowingId`. */
export class Follow extends Model<
    InferAttributes<Follow>,
    InferCreationAttributes<Follow>
> {
    declare Id: CreationOptional<number>;
    declare Uuid: CreationOptional<string>;
    declare FollowerId: ForeignKey<User['Id']>;
    declare FollowingId: ForeignKey<User['Id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare Follower?: NonAttribute<User>;
    declare Following?: NonAttribute<User>;
}

Follow.init(
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
        FollowerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'Id' },
        },
        FollowingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'Id' },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Follows',
        indexes: [
            {
                unique: true,
                fields: ['FollowerId', 'FollowingId'],
            },
        ],
    },
);

Follow.belongsTo(User, { foreignKey: 'FollowerId', as: 'Follower' });
Follow.belongsTo(User, { foreignKey: 'FollowingId', as: 'Following' });
User.hasMany(Follow, { foreignKey: 'FollowerId', as: 'FollowingRelations' });
User.hasMany(Follow, { foreignKey: 'FollowingId', as: 'FollowerRelations' });
