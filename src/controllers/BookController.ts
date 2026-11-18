import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateBookDTO, UpdateBookDTO } from '../@types/book';
import { bookService } from '../services/BookService';
import { parseId } from '../utils/parseId';

export class BookController {
    public async list(req: Request, res: Response): Promise<Response> {
        const books = await bookService.list();
        return res.status(StatusCodes.OK).json(books);
    }

    public async getById(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const book = await bookService.getById(id);
        return res.status(StatusCodes.OK).json(book);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateBookDTO = {
            Title: req.body.Title,
            Autor: req.body.Autor,
            CategoryId: Number(req.body.CategoryId),
            CreationDate: req.body.CreationDate ?? null,
            CreationLocality: req.body.CreationLocality ?? null,
        };
        const book = await bookService.create(data);
        return res.status(StatusCodes.CREATED).json(book);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const data: UpdateBookDTO = {
            Title: req.body.Title,
            Autor: req.body.Autor,
            CategoryId:
                req.body.CategoryId !== undefined ? Number(req.body.CategoryId) : undefined,
            CreationDate: req.body.CreationDate,
            CreationLocality: req.body.CreationLocality,
        };
        const book = await bookService.update(id, data);
        return res.status(StatusCodes.OK).json(book);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        await bookService.remove(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const bookController = new BookController();
