import { BookStatusName } from '../models/BookStatus';

/** Categoria embutida na resposta de um livro. */
export interface BookCategoryType {
    Uuid: string;
    Description: string;
}

/** Dono do livro — exposto publicamente apenas pelo nome. */
export interface BookOwnerType {
    Name: string;
}

/** Situação do livro na estante. */
export interface BookStatusType {
    Name: BookStatusName;
    Description: string;
}

/**
 * Representação pública de um livro. Não expõe `UserId` nem `Id` interno:
 * o dono aparece apenas como `Owner.Name` e as rotas usam `Uuid`.
 */
export interface BookType {
    Uuid: string;
    Title: string;
    Autor: string;
    Category?: BookCategoryType;
    Owner?: BookOwnerType;
    Status?: BookStatusType;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBookDTO {
    Title: string;
    Autor: string;
    /** UUID da categoria à qual o livro pertence. */
    CategoryUuid: string;
    /** Nome do status (`available` por padrão). */
    Status?: BookStatusName;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
}

export interface UpdateBookDTO {
    Title?: string;
    Autor?: string;
    CategoryUuid?: string;
    Status?: BookStatusName;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
}
