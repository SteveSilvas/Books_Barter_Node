import { Sequelize } from 'sequelize';
import { env } from '../config/env';

const { dialect, storage } = env.database;

export const sequelize =
    dialect === 'sqlite'
        ? new Sequelize({
              dialect: 'sqlite',
              storage,
              logging: false,
          })
        : new Sequelize(
              env.database.name,
              env.database.user,
              env.database.password,
              {
                  dialect,
                  host: env.database.host,
                  port: env.database.port,
                  logging: false,
              },
          );
