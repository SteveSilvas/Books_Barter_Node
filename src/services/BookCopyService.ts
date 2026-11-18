import { StatusCodes } from 'http-status-codes';
import {
    BookCopyType,
    CreateBookCopyDTO,
    UpdateBookCopyDTO,
} from '../@types/bookCopy';
import { AppError } from '../errors/AppError';
import { BookCopy } from '../models';

export interface IBookCopyService {
    list(): Promise<BookCopyType[]>;
    getById(id: number): Promise<BookCopyType>;
    create(data: CreateBookCopyDTO): Promise<BookCopyType>;
    update(id: number, data: UpdateBookCopyDTO): Promise<BookCopyType>;
    remove(id: number): Promise<void>;
}

export class BookCopyService implements IBookCopyService {
    public async list(): Promise<BookCopyType[]> {
        const copies = await BookCopy.findAll();
        return copies.map((copy) => copy.get({ plain: true }) as BookCopyType);
    }

    public async getById(id: number): Promise<BookCopyType> {
        const copy = await BookCopy.findByPk(id);
        if (!copy) {
            throw new AppError('Exemplar não encontrado.', StatusCodes.NOT_FOUND);
        }
        return copy.get({ plain: true }) as BookCopyType;
    }

    public async create(data: CreateBookCopyDTO): Promise<BookCopyType> {
        const copy = await BookCopy.create(data);
        return copy.get({ plain: true }) as BookCopyType;
    }

    public async update(id: number, data: UpdateBookCopyDTO): Promise<BookCopyType> {
        const copy = await BookCopy.findByPk(id);
        if (!copy) {
            throw new AppError('Exemplar não encontrado.', StatusCodes.NOT_FOUND);
        }

        if (data.ISBN !== undefined) copy.ISBN = data.ISBN;
        if (data.Editora !== undefined) copy.Editora = data.Editora;
        if (data.TypePrint !== undefined) copy.TypePrint = data.TypePrint;
        if (data.PublicationDate !== undefined) copy.PublicationDate = data.PublicationDate;
        if (data.PublicationLocality !== undefined) {
            copy.PublicationLocality = data.PublicationLocality;
        }

        await copy.save();
        return copy.get({ plain: true }) as BookCopyType;
    }

    public async remove(id: number): Promise<void> {
        const copy = await BookCopy.findByPk(id);
        if (!copy) {
            throw new AppError('Exemplar não encontrado.', StatusCodes.NOT_FOUND);
        }
        await copy.destroy();
    }
}

export const bookCopyService = new BookCopyService();
