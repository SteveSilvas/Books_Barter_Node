import { Express } from 'express';
import { createApp } from '../../src/app';
import { runMigrations } from '../../src/database/migrator';
import { seedBookStatuses, sequelize } from '../../src/models';

/**
 * Cria uma instância do Express com o banco de teste recriado pelas mesmas
 * migrações usadas em produção (SQLite, configurado em tests/setup-env.ts).
 */
export async function createTestApp(): Promise<Express> {
    await sequelize.getQueryInterface().dropAllTables();
    await runMigrations();
    await seedBookStatuses();
    return createApp();
}

export async function closeDatabase(): Promise<void> {
    await sequelize.close();
}
