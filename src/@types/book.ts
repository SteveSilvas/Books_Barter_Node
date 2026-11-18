export interface BookType {
    Id: number;
    Title: string;
    Autor: string;
    CategoryId: number;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBookDTO {
    Title: string;
    Autor: string;
    CategoryId: number;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
}

export interface UpdateBookDTO {
    Title?: string;
    Autor?: string;
    CategoryId?: number;
    CreationDate?: Date | null;
    CreationLocality?: string | null;
}
