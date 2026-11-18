import { Op, WhereOptions } from 'sequelize';
import { StatusCodes } from 'http-status-codes';
import { PublicUserType } from '../@types/user';
import { AppError } from '../errors/AppError';
import { Follow, User } from '../models';
import {
    Paged,
    Pagination,
    SortSpec,
    buildPageMeta,
} from '../utils/query';

const DEFAULT_PAGINATION: Pagination = { limit: 20, offset: 0 };
const DEFAULT_SORT: SortSpec = { field: 'createdAt', order: 'desc' };

const USER_ATTRIBUTES = ['Uuid', 'Name', 'Provider'];

export interface IFollowService {
    follow(followerId: number, targetUuid: string): Promise<void>;
    unfollow(followerId: number, targetUuid: string): Promise<void>;
    listFollowers(
        userUuid: string,
        pagination?: Pagination,
        sort?: SortSpec,
    ): Promise<Paged<PublicUserType>>;
    listFollowing(
        userUuid: string,
        pagination?: Pagination,
        sort?: SortSpec,
    ): Promise<Paged<PublicUserType>>;
    countFollowers(userId: number): Promise<number>;
    countFollowing(userId: number): Promise<number>;
}

function toPublic(user: User): PublicUserType {
    const { Uuid, Name, Provider } = user.get({ plain: true });
    return { Uuid, Name, Provider };
}

export class FollowService implements IFollowService {
    /** Resolve o id interno a partir do UUID público. */
    private async resolveUserId(uuid: string): Promise<number> {
        const user = await User.findOne({ where: { Uuid: uuid }, attributes: ['Id'] });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return user.Id;
    }

    public async follow(followerId: number, targetUuid: string): Promise<void> {
        const followingId = await this.resolveUserId(targetUuid);

        if (followerId === followingId) {
            throw new AppError(
                'Você não pode seguir a si mesmo.',
                StatusCodes.BAD_REQUEST,
            );
        }

        const existing = await Follow.findOne({
            where: { FollowerId: followerId, FollowingId: followingId },
        });
        if (existing) {
            throw new AppError(
                'Você já segue este usuário.',
                StatusCodes.CONFLICT,
            );
        }

        await Follow.create({ FollowerId: followerId, FollowingId: followingId });
    }

    public async unfollow(followerId: number, targetUuid: string): Promise<void> {
        const followingId = await this.resolveUserId(targetUuid);

        const deleted = await Follow.destroy({
            where: { FollowerId: followerId, FollowingId: followingId },
        });
        if (deleted === 0) {
            throw new AppError(
                'Você não segue este usuário.',
                StatusCodes.NOT_FOUND,
            );
        }
    }

    /** Seguidores de um usuário: quem segue `userUuid`. */
    public async listFollowers(
        userUuid: string,
        pagination: Pagination = DEFAULT_PAGINATION,
        sort: SortSpec = DEFAULT_SORT,
    ): Promise<Paged<PublicUserType>> {
        const userId = await this.resolveUserId(userUuid);
        return this.listRelated('FollowingId', userId, pagination, sort);
    }

    /** Quem um usuário segue. */
    public async listFollowing(
        userUuid: string,
        pagination: Pagination = DEFAULT_PAGINATION,
        sort: SortSpec = DEFAULT_SORT,
    ): Promise<Paged<PublicUserType>> {
        const userId = await this.resolveUserId(userUuid);
        return this.listRelated('FollowerId', userId, pagination, sort);
    }

    /**
     * Lista os usuários do outro lado da relação. `localKey` é a coluna que
     * aponta para `userId` (o dono da lista); o usuário exibido é o lado oposto.
     */
    private async listRelated(
        localKey: 'FollowerId' | 'FollowingId',
        userId: number,
        pagination: Pagination,
        sort: SortSpec,
    ): Promise<Paged<PublicUserType>> {
        const otherAlias = localKey === 'FollowingId' ? 'Follower' : 'Following';
        const where: WhereOptions = { [localKey]: userId };

        const { rows, count } = await Follow.findAndCountAll({
            where,
            include: [{ model: User, as: otherAlias, attributes: USER_ATTRIBUTES }],
            order: [[{ model: User, as: otherAlias }, sort.field, sort.order.toUpperCase()]],
            limit: pagination.limit,
            offset: pagination.offset,
            distinct: true,
        });

        const data = rows.map((row) =>
            toPublic(row.get(otherAlias) as User),
        );
        return { data, meta: buildPageMeta(count, pagination, rows.length) };
    }

    public async countFollowers(userId: number): Promise<number> {
        return Follow.count({ where: { FollowingId: userId } });
    }

    public async countFollowing(userId: number): Promise<number> {
        return Follow.count({ where: { FollowerId: userId } });
    }
}

export const followService = new FollowService();
