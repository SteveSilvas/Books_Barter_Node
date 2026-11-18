import { Sequelize } from 'sequelize';
import { env } from '../config/env';

export const sequelize = new Sequelize(
    env.database.name,
    env.database.user,
    env.database.password,
    {
        dialect: env.database.dialect,
        host: env.database.host,
        port: env.database.port,
        logging: false,
    },
);
