import { StatusCodes } from 'http-status-codes';
import { FavoriteBookType } from '../@types/social';
import { PublicUserType } from '../@types/user';
import { AppError } from '../errors/AppError';
import { FavoriteBook, FavoriteShelf, User } from '../models';
import { bookService } from './BookService';
import { Paged, Pagination, SortSpec, buildPageMeta } from '../utils/query';

const DEFAULT_PAGINATION: Pagination = { limit: 20, offset: 0 };
const DEFAULT_SORT: SortSpec = { field: 'createdAt', order: 'desc' };

export interface IFavoriteService {
    favoriteShelf(userId: number, ownerUuid: string): Promise<void>;
    unfavoriteShelf(userId: number, ownerUuid: string): Promise<void>;
    favoriteBook(userId: number, bookUuid: string): Promise<void>;
    unfavoriteBook(userId: number, bookUuid: string): Promise<void>;
    listFavoriteShelves(
        userId: number,
        pagination?: Pagination,
        sort?: SortSpec,
    ): Promise<Paged<PublicUserType>>;
    listFavoriteBooks(
        userId: number,
        pagination?: Pagination,
        sort?: SortSpec,
    ): Promise<Paged<FavoriteBookType>>;
}

export class FavoriteService implements IFavoriteService {
    private async resolveUserId(uuid: string): Promise<number> {
        const user = await User.findOne({ where: { Uuid: uuid }, attributes: ['Id'] });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return user.Id;
    }

    public async favoriteShelf(userId: number, ownerUuid: string): Promise<void> {
        const shelfOwnerId = await this.resolveUserId(ownerUuid);
        if (userId === shelfOwnerId) {
            throw new AppError(
                'Você não pode favoritar a sua própria estante.',
                StatusCodes.BAD_REQUEST,
            );
        }

        const existing = await FavoriteShelf.findOne({
            where: { UserId: userId, ShelfOwnerId: shelfOwnerId },
        });
        if (existing) {
            throw new AppError(
                'Você já favoritou esta estante.',
                StatusCodes.CONFLICT,
            );
        }

        await FavoriteShelf.create({ UserId: userId, ShelfOwnerId: shelfOwnerId });
    }

    public async unfavoriteShelf(userId: number, ownerUuid: string): Promise<void> {
        const shelfOwnerId = await this.resolveUserId(ownerUuid);
        const deleted = await FavoriteShelf.destroy({
            where: { UserId: userId, ShelfOwnerId: shelfOwnerId },
        });
        if (deleted === 0) {
            throw new AppError(
                'Você não favoritou esta estante.',
                StatusCodes.NOT_FOUND,
            );
        }
    }

    public async favoriteBook(userId: number, bookUuid: string): Promise<void> {
        const BookId = await bookService.resolveBookId(bookUuid);
        const ownerId = await bookService.findOwnerIdByBookUuid(bookUuid);
        if (ownerId === userId) {
            throw new AppError(
                'Você não pode favoritar o seu próprio livro.',
                StatusCodes.BAD_REQUEST,
            );
        }

        const existing = await FavoriteBook.findOne({ where: { UserId: userId, BookId } });
        if (existing) {
            throw new AppError(
                'Você já favoritou este livro.',
                StatusCodes.CONFLICT,
            );
        }

        await FavoriteBook.create({ UserId: userId, BookId });
    }

    public async unfavoriteBook(userId: number, bookUuid: string): Promise<void> {
        const BookId = await bookService.resolveBookId(bookUuid);
        const deleted = await FavoriteBook.destroy({ where: { UserId: userId, BookId } });
        if (deleted === 0) {
            throw new AppError(
                'Você não favoritou este livro.',
                StatusCodes.NOT_FOUND,
            );
        }
    }

    /** Estantes favoritadas: os donos cujas estantes `userId` favoritou. */
    public async listFavoriteShelves(
        userId: number,
        pagination: Pagination = DEFAULT_PAGINATION,
        sort: SortSpec = DEFAULT_SORT,
    ): Promise<Paged<PublicUserType>> {
        const { rows, count } = await FavoriteShelf.findAndCountAll({
            where: { UserId: userId },
            include: [
                { model: User, as: 'ShelfOwner', attributes: ['Uuid', 'Name', 'Provider'] },
            ],
            order: [[{ model: User, as: 'ShelfOwner' }, sort.field, sort.order.toUpperCase()]],
            limit: pagination.limit,
            offset: pagination.offset,
            distinct: true,
        });

        const data = rows.map((row) => {
            const { Uuid, Name, Provider } = (
                row.get('ShelfOwner') as User
            ).get({ plain: true });
            return { Uuid, Name, Provider };
        });
        return { data, meta: buildPageMeta(count, pagination, rows.length) };
    }

    /** Livros favoritados, com a data em que cada um foi favoritado. */
    public async listFavoriteBooks(
        userId: number,
        pagination: Pagination = DEFAULT_PAGINATION,
        sort: SortSpec = DEFAULT_SORT,
    ): Promise<Paged<FavoriteBookType>> {
        const { rows, count } = await FavoriteBook.findAndCountAll({
            where: { UserId: userId },
            order: [[sort.field, sort.order.toUpperCase()]],
            limit: pagination.limit,
            offset: pagination.offset,
            distinct: true,
        });

        const booksById = await bookService.findManyByIds(
            rows.map((row) => row.BookId as number),
        );

        const data = rows
            .map((row) => {
                const book = booksById.get(row.BookId as number);
                if (!book) {
                    return null;
                }
                return { ...book, FavoritedAt: row.createdAt };
            })
            .filter((item): item is FavoriteBookType => item !== null);

        return { data, meta: buildPageMeta(count, pagination, rows.length) };
    }
}

export const favoriteService = new FavoriteService();
