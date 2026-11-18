import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateBookDTO, UpdateBookDTO } from '../@types/book';
import { BookStatusName } from '../models/BookStatus';
import { bookService } from '../services/BookService';
import { parseUuid } from '../utils/parseId';
import {
    parseBookQuery,
    parsePagination,
    parseSort,
} from '../utils/query';

export class BookController {
    /**
     * Catálogo público: apenas livros disponíveis (`available`), com filtros
     * (`title`, `categoryUuid`, `ownerUuid`, `status`), ordenação e paginação.
     */
    public async list(req: Request, res: Response): Promise<Response> {
        const filter = parseBookQuery(req.query);
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order);
        const page = await bookService.list(filter, pagination, sort);
        return res.status(StatusCodes.OK).json(page);
    }

    /** Estante pessoal do usuário autenticado (todos os status). */
    public async listMine(req: Request, res: Response): Promise<Response> {
        const filter = parseBookQuery(req.query);
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order);
        const page = await bookService.list(
            { ...filter, ownerId: req.user!.Id, includeAllStatuses: true },
            pagination,
            sort,
        );
        return res.status(StatusCodes.OK).json(page);
    }

    /** Estante pública de outro usuário, identificado pelo UUID. */
    public async listByOwner(req: Request, res: Response): Promise<Response> {
        const ownerUuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        const filter = parseBookQuery(req.query);
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order);
        const ownerId = await bookService.resolveOwnerId(ownerUuid);
        const page = await bookService.list(
            { ...filter, ownerId, ownerUuid: undefined },
            pagination,
            sort,
        );
        return res.status(StatusCodes.OK).json(page);
    }

    public async getByUuid(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const book = await bookService.getByUuid(uuid);
        return res.status(StatusCodes.OK).json(book);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateBookDTO = {
            Title: req.body.Title,
            Autor: req.body.Autor,
            CategoryUuid: req.body.CategoryUuid,
            Status: req.body.Status,
            CreationDate: req.body.CreationDate ?? null,
            CreationLocality: req.body.CreationLocality ?? null,
        };
        const book = await bookService.create(req.user!.Id, data);
        return res.status(StatusCodes.CREATED).json(book);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const data: UpdateBookDTO = {
            Title: req.body.Title,
            Autor: req.body.Autor,
            CategoryUuid: req.body.CategoryUuid,
            Status: req.body.Status as BookStatusName | undefined,
            CreationDate: req.body.CreationDate,
            CreationLocality: req.body.CreationLocality,
        };
        const book = await bookService.update(req.user!.Id, uuid, data);
        return res.status(StatusCodes.OK).json(book);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        await bookService.remove(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const bookController = new BookController();
