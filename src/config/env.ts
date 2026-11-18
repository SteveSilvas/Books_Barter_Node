import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config({ path: '.env' });

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
    }
    return value;
}

export interface ServerConfig {
    port: number;
}

export interface DatabaseConfig {
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    dialect: Dialect;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
}

export const env: AppConfig = {
    server: {
        port: Number(process.env.PORT ?? 3000),
    },
    database: {
        name: required('DB_NAME'),
        user: required('DB_USER'),
        password: process.env.DB_PASSWORD ?? '',
        host: required('DB_HOST'),
        port: Number(process.env.DB_PORT ?? 3306),
        dialect: (process.env.DB_DIALECT ?? 'mysql') as Dialect,
    },
};
