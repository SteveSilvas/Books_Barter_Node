import { sequelize } from '../database';
import { Address } from './Address';
import { Book } from './Book';
import { BookCopy } from './BookCopy';
import { BookStatus, BOOK_STATUS_SEED } from './BookStatus';
import { Category } from './Category';
import { User } from './User';

/**
 * Garante que todos os models estão registrados na conexão antes de
 * sincronizar o schema. As associações são declaradas nos próprios models.
 */
export async function syncDatabase(): Promise<void> {
    await sequelize.sync();
    await seedBookStatuses();
}

/** Insere os status de livro padrão, ignorando os que já existem. */
export async function seedBookStatuses(): Promise<void> {
    for (const status of BOOK_STATUS_SEED) {
        await BookStatus.findOrCreate({
            where: { Name: status.Name },
            defaults: status,
        });
    }
}

export { sequelize, Address, Book, BookCopy, BookStatus, Category, User };
