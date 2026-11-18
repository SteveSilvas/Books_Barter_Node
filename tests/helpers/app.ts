import { Express } from 'express';
import { createApp } from '../../src/app';
import { seedBookStatuses, sequelize } from '../../src/models';

/**
 * Cria uma instância do Express com o banco de teste já sincronizado e limpo.
 * Usa SQLite (configurado em tests/setup-env.ts), sem depender de MySQL.
 */
export async function createTestApp(): Promise<Express> {
    await sequelize.sync({ force: true });
    await seedBookStatuses();
    return createApp();
}

export async function closeDatabase(): Promise<void> {
    await sequelize.close();
}
