import { createApp } from './app';
import { env } from './config/env';
import { runMigrations } from './database/migrator';
import { seedBookStatuses, sequelize } from './models';

async function bootstrap(): Promise<void> {
    await sequelize.authenticate();
    await runMigrations();
    await seedBookStatuses();

    const app = createApp();

    app.listen(env.server.port, () => {
        console.log(`Servidor iniciado na porta ${env.server.port}.`);
    });
}

bootstrap().catch((error) => {
    console.error('Falha ao iniciar a aplicação:', error);
    process.exit(1);
});
