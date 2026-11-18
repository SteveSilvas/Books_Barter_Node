import { Op } from 'sequelize';
import { StatusCodes } from 'http-status-codes';
import {
    BookType,
    CreateBookDTO,
    UpdateBookDTO,
} from '../@types/book';
import { AppError } from '../errors/AppError';
import { Book, BookStatus, Category, User } from '../models';
import { BookStatusName } from '../models/BookStatus';

export interface ListBooksFilter {
    /** Trecho do título (busca parcial, case-insensitive). */
    title?: string;
}

export interface IBookService {
    list(filter?: ListBooksFilter): Promise<BookType[]>;
    listByOwner(userId: number): Promise<BookType[]>;
    getByUuid(uuid: string): Promise<BookType>;
    create(userId: number, data: CreateBookDTO): Promise<BookType>;
    update(userId: number, uuid: string, data: UpdateBookDTO): Promise<BookType>;
    remove(userId: number, uuid: string): Promise<void>;
}

const INCLUDE = [
    { model: Category, as: 'Category', attributes: ['Uuid', 'Description'] },
    { model: User, as: 'Owner', attributes: ['Name'] },
    { model: BookStatus, as: 'Status', attributes: ['Name', 'Description'] },
];

/** Projeção pública: sem `Id` interno e sem `UserId` (dono só pelo nome). */
function toPublic(book: Book): BookType {
    const raw = book.get({ plain: true }) as unknown as Record<string, any>;
    return {
        Uuid: raw.Uuid,
        Title: raw.Title,
        Autor: raw.Autor,
        Category: raw.Category
            ? { Uuid: raw.Category.Uuid, Description: raw.Category.Description }
            : undefined,
        Owner: raw.Owner ? { Name: raw.Owner.Name } : undefined,
        Status: raw.Status
            ? { Name: raw.Status.Name, Description: raw.Status.Description }
            : undefined,
        CreationDate: raw.CreationDate,
        CreationLocality: raw.CreationLocality,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

export class BookService implements IBookService {
    /** Catálogo público de livros, com busca opcional por título. */
    public async list(filter: ListBooksFilter = {}): Promise<BookType[]> {
        const where = filter.title
            ? { Title: { [Op.like]: `%${filter.title}%` } }
            : undefined;
        const books = await Book.findAll({
            where,
            order: [['Id', 'DESC']],
            include: INCLUDE,
        });
        return books.map(toPublic);
    }

    /** Estante pessoal: somente os livros do próprio dono. */
    public async listByOwner(userId: number): Promise<BookType[]> {
        const books = await Book.findAll({
            where: { UserId: userId },
            order: [['Id', 'DESC']],
            include: INCLUDE,
        });
        return books.map(toPublic);
    }

    public async getByUuid(uuid: string): Promise<BookType> {
        const book = await this.findByUuid(uuid);
        return toPublic(book);
    }

    public async create(userId: number, data: CreateBookDTO): Promise<BookType> {
        const CategoryId = await this.resolveCategoryId(data.CategoryUuid);
        const StatusId = await this.resolveStatusId(data.Status);

        const book = await Book.create({
            Title: data.Title,
            Autor: data.Autor,
            CategoryId,
            UserId: userId,
            StatusId,
            CreationDate: data.CreationDate ?? null,
            CreationLocality: data.CreationLocality ?? null,
        });

        const created = await this.findByUuid(book.Uuid);
        return toPublic(created);
    }

    public async update(
        userId: number,
        uuid: string,
        data: UpdateBookDTO,
    ): Promise<BookType> {
        const book = await this.findByUuid(uuid);
        this.assertOwnership(book, userId);

        if (data.CategoryUuid !== undefined) {
            book.CategoryId = await this.resolveCategoryId(data.CategoryUuid);
        }
        if (data.Status !== undefined) {
            book.StatusId = await this.resolveStatusId(data.Status);
        }
        if (data.Title !== undefined) book.Title = data.Title;
        if (data.Autor !== undefined) book.Autor = data.Autor;
        if (data.CreationDate !== undefined) book.CreationDate = data.CreationDate;
        if (data.CreationLocality !== undefined) {
            book.CreationLocality = data.CreationLocality;
        }

        await book.save();
        const updated = await this.findByUuid(uuid);
        return toPublic(updated);
    }

    public async remove(userId: number, uuid: string): Promise<void> {
        const book = await this.findByUuid(uuid);
        this.assertOwnership(book, userId);
        await book.destroy();
    }

    private async findByUuid(uuid: string): Promise<Book> {
        const book = await Book.findOne({ where: { Uuid: uuid }, include: INCLUDE });
        if (!book) {
            throw new AppError('Livro não encontrado.', StatusCodes.NOT_FOUND);
        }
        return book;
    }

    private assertOwnership(book: Book, userId: number): void {
        if (book.UserId !== userId) {
            throw new AppError(
                'Você só pode alterar os seus próprios livros.',
                StatusCodes.FORBIDDEN,
            );
        }
    }

    private async resolveCategoryId(uuid: string): Promise<number> {
        const category = await Category.findOne({ where: { Uuid: uuid } });
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
        return category.Id;
    }

    private async resolveStatusId(name?: BookStatusName): Promise<number> {
        const status = await BookStatus.findOne({
            where: { Name: name ?? 'available' },
        });
        if (!status) {
            throw new AppError('Status de livro inválido.', StatusCodes.BAD_REQUEST);
        }
        return status.Id;
    }
}

export const bookService = new BookService();
