import { sequelize } from '../database';
import { Address } from './Address';
import { Book } from './Book';
import { BookCopy } from './BookCopy';
import { BookStatus, BOOK_STATUS_SEED } from './BookStatus';
import { Category } from './Category';
import { FavoriteBook } from './FavoriteBook';
import { FavoriteShelf } from './FavoriteShelf';
import { Follow } from './Follow';
import { User } from './User';

/**
 * Insere os status de livro padrão, ignorando os que já existem.
 * O schema é gerenciado por migrações (`src/database/migrator.ts`).
 */
export async function seedBookStatuses(): Promise<void> {
    for (const status of BOOK_STATUS_SEED) {
        await BookStatus.findOrCreate({
            where: { Name: status.Name },
            defaults: status,
        });
    }
}

export {
    sequelize,
    Address,
    Book,
    BookCopy,
    BookStatus,
    Category,
    FavoriteBook,
    FavoriteShelf,
    Follow,
    User,
};
