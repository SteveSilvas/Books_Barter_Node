export interface BookCopyType {
    Id: number;
    ISBN?: string | null;
    Editora: string;
    TypePrint: string;
    PublicationDate: Date;
    PublicationLocality?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBookCopyDTO {
    ISBN?: string | null;
    Editora: string;
    TypePrint: string;
    PublicationDate: Date;
    PublicationLocality?: string | null;
}

export interface UpdateBookCopyDTO {
    ISBN?: string | null;
    Editora?: string;
    TypePrint?: string;
    PublicationDate?: Date;
    PublicationLocality?: string | null;
}
