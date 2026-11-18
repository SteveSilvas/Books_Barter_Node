import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateBookCopyDTO, UpdateBookCopyDTO } from '../@types/bookCopy';
import { bookCopyService } from '../services/BookCopyService';
import { parseId } from '../utils/parseId';

export class BookCopyController {
    public async list(req: Request, res: Response): Promise<Response> {
        const copies = await bookCopyService.list();
        return res.status(StatusCodes.OK).json(copies);
    }

    public async getById(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const copy = await bookCopyService.getById(id);
        return res.status(StatusCodes.OK).json(copy);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateBookCopyDTO = {
            ISBN: req.body.ISBN ?? null,
            Editora: req.body.Editora,
            TypePrint: req.body.TypePrint,
            PublicationDate: req.body.PublicationDate,
            PublicationLocality: req.body.PublicationLocality ?? null,
        };
        const copy = await bookCopyService.create(data);
        return res.status(StatusCodes.CREATED).json(copy);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const data: UpdateBookCopyDTO = {
            ISBN: req.body.ISBN,
            Editora: req.body.Editora,
            TypePrint: req.body.TypePrint,
            PublicationDate: req.body.PublicationDate,
            PublicationLocality: req.body.PublicationLocality,
        };
        const copy = await bookCopyService.update(id, data);
        return res.status(StatusCodes.OK).json(copy);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        await bookCopyService.remove(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const bookCopyController = new BookCopyController();
