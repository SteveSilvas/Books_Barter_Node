import { sequelize } from '../database';
import { Address } from './Address';
import { Book } from './Book';
import { BookCopy } from './BookCopy';
import { Category } from './Category';
import { User } from './User';

/**
 * Garante que todos os models estão registrados na conexão antes de
 * sincronizar o schema. As associações são declaradas nos próprios models.
 */
export async function syncDatabase(): Promise<void> {
    await sequelize.sync();
}

export { sequelize, Address, Book, BookCopy, Category, User };
