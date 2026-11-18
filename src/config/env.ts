import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config({ path: '.env', quiet: true });

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
    storage?: string;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
}

const dialect = (process.env.DB_DIALECT ?? 'mysql') as Dialect;
const isSqlite = dialect === 'sqlite';

export const env: AppConfig = {
    server: {
        port: Number(process.env.PORT ?? 3000),
    },
    database: {
        // SQLite (usado nos testes) não exige usuário/host nem banco nomeado.
        name: isSqlite ? (process.env.DB_NAME ?? 'database') : required('DB_NAME'),
        user: isSqlite ? '' : required('DB_USER'),
        password: process.env.DB_PASSWORD ?? '',
        host: isSqlite ? '' : required('DB_HOST'),
        port: Number(process.env.DB_PORT ?? 3306),
        dialect,
        storage: isSqlite ? (process.env.DB_STORAGE ?? ':memory:') : undefined,
    },
};
