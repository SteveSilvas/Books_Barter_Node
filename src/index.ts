import { createApp } from './app';
import { env } from './config/env';
import { sequelize, syncDatabase } from './models';

async function bootstrap(): Promise<void> {
    await sequelize.authenticate();
    await syncDatabase();

    const app = createApp();

    app.listen(env.server.port, () => {
        console.log(`Servidor iniciado na porta ${env.server.port}.`);
    });
}

bootstrap().catch((error) => {
    console.error('Falha ao iniciar a aplicação:', error);
    process.exit(1);
});
