import { StatusCodes } from 'http-status-codes';
import {
    BookType,
    CreateBookDTO,
    UpdateBookDTO,
} from '../@types/book';
import { AppError } from '../errors/AppError';
import { Book, Category } from '../models';

export interface IBookService {
    list(): Promise<BookType[]>;
    getById(id: number): Promise<BookType>;
    create(data: CreateBookDTO): Promise<BookType>;
    update(id: number, data: UpdateBookDTO): Promise<BookType>;
    remove(id: number): Promise<void>;
}

export class BookService implements IBookService {
    public async list(): Promise<BookType[]> {
        const books = await Book.findAll({
            order: [['Id', 'DESC']],
            include: [{ model: Category, as: 'Category', attributes: ['Id', 'Description'] }],
        });
        return books.map((book) => book.get({ plain: true }) as BookType);
    }

    public async getById(id: number): Promise<BookType> {
        const book = await Book.findByPk(id, {
            include: [{ model: Category, as: 'Category', attributes: ['Id', 'Description'] }],
        });
        if (!book) {
            throw new AppError('Livro não encontrado.', StatusCodes.NOT_FOUND);
        }
        return book.get({ plain: true }) as BookType;
    }

    public async create(data: CreateBookDTO): Promise<BookType> {
        await this.ensureCategoryExists(data.CategoryId);
        const book = await Book.create(data);
        return book.get({ plain: true }) as BookType;
    }

    public async update(id: number, data: UpdateBookDTO): Promise<BookType> {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new AppError('Livro não encontrado.', StatusCodes.NOT_FOUND);
        }

        if (data.CategoryId !== undefined) {
            await this.ensureCategoryExists(data.CategoryId);
            book.CategoryId = data.CategoryId;
        }
        if (data.Title !== undefined) book.Title = data.Title;
        if (data.Autor !== undefined) book.Autor = data.Autor;
        if (data.CreationDate !== undefined) book.CreationDate = data.CreationDate;
        if (data.CreationLocality !== undefined) {
            book.CreationLocality = data.CreationLocality;
        }

        await book.save();
        return book.get({ plain: true }) as BookType;
    }

    public async remove(id: number): Promise<void> {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new AppError('Livro não encontrado.', StatusCodes.NOT_FOUND);
        }
        await book.destroy();
    }

    private async ensureCategoryExists(categoryId: number): Promise<void> {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
    }
}

export const bookService = new BookService();
