import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateBookCopyDTO, UpdateBookCopyDTO } from '../@types/bookCopy';
import { bookCopyService } from '../services/BookCopyService';
import { parseUuid } from '../utils/parseId';

export class BookCopyController {
    public async list(req: Request, res: Response): Promise<Response> {
        const copies = await bookCopyService.list();
        return res.status(StatusCodes.OK).json(copies);
    }

    public async getByUuid(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const copy = await bookCopyService.getByUuid(uuid);
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
        const uuid = parseUuid(req.params.uuid);
        const data: UpdateBookCopyDTO = {
            ISBN: req.body.ISBN,
            Editora: req.body.Editora,
            TypePrint: req.body.TypePrint,
            PublicationDate: req.body.PublicationDate,
            PublicationLocality: req.body.PublicationLocality,
        };
        const copy = await bookCopyService.update(uuid, data);
        return res.status(StatusCodes.OK).json(copy);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        await bookCopyService.remove(uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const bookCopyController = new BookCopyController();
