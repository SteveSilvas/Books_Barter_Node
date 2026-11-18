import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateBookDTO, UpdateBookDTO } from '../@types/book';
import { BookStatusName } from '../models/BookStatus';
import { bookService } from '../services/BookService';
import { parseUuid } from '../utils/parseId';

export class BookController {
    /** Catálogo público, com busca opcional por título (`?title=`). */
    public async list(req: Request, res: Response): Promise<Response> {
        const title =
            typeof req.query.title === 'string' ? req.query.title : undefined;
        const books = await bookService.list({ title });
        return res.status(StatusCodes.OK).json(books);
    }

    /** Estante pessoal do usuário autenticado. */
    public async listMine(req: Request, res: Response): Promise<Response> {
        const books = await bookService.listByOwner(req.user!.Id);
        return res.status(StatusCodes.OK).json(books);
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
