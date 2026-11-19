import path from 'path';
import { QueryInterface, Sequelize } from 'sequelize';
import { Resolver, SequelizeStorage, Umzug } from 'umzug';
import { sequelize } from './index';

/** Contexto entregue a cada migração. */
export interface MigrationContext {
    sequelize: Sequelize;
    queryInterface: QueryInterface;
}

/**
 * Diretório das migrações. Em dev os arquivos são `.ts` (executados via tsx);
 * após o build passam a ser `.js` em `dist/database/migrations`.
 */
export const migrationsFolder = path.join(__dirname, 'migrations');

const migrationsGlob = path.join(migrationsFolder, '*.{ts,js}');

/**
 * Resolve uma migração carregando o módulo via `require`. Funciona nos três
 * ambientes (tsx, Jest com @swc/jest e o build compilado em dist).
 */
const resolver: Resolver<MigrationContext> = ({ name, path: filepath }) => {
    if (!filepath) {
        throw new Error(`Migração sem caminho de arquivo: ${name}`);
    }
    const load = () => require(filepath) as {
        up: (params: unknown) => Promise<unknown>;
        down?: (params: unknown) => Promise<unknown>;
    };
    return {
        name,
        up: async ({ context }) => load().up({ name, path: filepath, context }),
        down: async ({ context }) => load().down?.({ name, path: filepath, context }),
    };
};

/** Conteúdo inicial de uma nova migração, no padrão do projeto. */
const migrationTemplate = `import type { Migration } from '../migrator';

export const up: Migration = async ({ context }) => {
    const { queryInterface } = context;
};

export const down: Migration = async ({ context }) => {
    const { queryInterface } = context;
};
`;

/** Cria uma instância do Umzug configurada para o Sequelize atual. */
export function createMigrator(): Umzug<MigrationContext> {
    return new Umzug<MigrationContext>({
        migrations: { glob: migrationsGlob, resolve: resolver },
        context: {
            sequelize,
            queryInterface: sequelize.getQueryInterface(),
        },
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
        create: {
            folder: migrationsFolder,
            template: async (filepath) => [[filepath, migrationTemplate]],
        },
    });
}

export const migrator = createMigrator();

/** Tipo de uma migração, para tipar `up`/`down` nos arquivos de migração. */
export type Migration = typeof migrator._types.migration;

/** Aplica todas as migrações pendentes. */
export async function runMigrations(): Promise<void> {
    await migrator.up();
}

/** Reverte a última migração aplicada. */
export async function rollbackMigration(): Promise<void> {
    await migrator.down();
}
