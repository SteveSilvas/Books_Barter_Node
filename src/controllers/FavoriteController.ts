import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { favoriteService } from '../services/FavoriteService';
import { parseUuid } from '../utils/parseId';
import { parsePagination, parseSort } from '../utils/query';

export class FavoriteController {
    /** Favorita a estante do usuário identificado pelo UUID. */
    public async favoriteShelf(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        await favoriteService.favoriteShelf(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    public async unfavoriteShelf(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        await favoriteService.unfavoriteShelf(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    /** Favorita o livro identificado pelo UUID. */
    public async favoriteBook(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do livro');
        await favoriteService.favoriteBook(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    public async unfavoriteBook(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do livro');
        await favoriteService.unfavoriteBook(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    public async listShelves(req: Request, res: Response): Promise<Response> {
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order, {
            fields: ['createdAt', 'updatedAt', 'Name'],
        });
        const page = await favoriteService.listFavoriteShelves(
            req.user!.Id,
            pagination,
            sort,
        );
        return res.status(StatusCodes.OK).json(page);
    }

    public async listBooks(req: Request, res: Response): Promise<Response> {
        const pagination = parsePagination(req.query.limit, req.query.offset);
        // FavoriteBook só possui createdAt/updatedAt; Title/Autor vivem em Book.
        const sort = parseSort(req.query.sort, req.query.order, {
            fields: ['createdAt', 'updatedAt'],
        });
        const page = await favoriteService.listFavoriteBooks(
            req.user!.Id,
            pagination,
            sort,
        );
        return res.status(StatusCodes.OK).json(page);
    }
}

export const favoriteController = new FavoriteController();
