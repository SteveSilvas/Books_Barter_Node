import { sequelize } from '../database';
import { migrator } from '../database/migrator';

/**
 * CLI de migrações. Uso:
 *   tsx src/scripts/migrate.ts up             # aplica todas as pendentes
 *   tsx src/scripts/migrate.ts down           # reverte a última aplicada
 *   tsx src/scripts/migrate.ts status         # lista aplicadas e pendentes
 *   tsx src/scripts/migrate.ts create <nome>  # cria um novo arquivo de migração
 */
async function main(): Promise<void> {
    const command = process.argv[2] ?? 'up';

    try {
        // `create` apenas gera um arquivo; não precisa de conexão com o banco.
        if (command !== 'create') {
            await sequelize.authenticate();
        }

        switch (command) {
            case 'up': {
                const applied = await migrator.up();
                console.log(
                    applied.length
                        ? `Migrações aplicadas: ${applied.map((m) => m.name).join(', ')}`
                        : 'Nenhuma migração pendente.',
                );
                break;
            }
            case 'down': {
                const reverted = await migrator.down();
                console.log(
                    reverted.length
                        ? `Migração revertida: ${reverted.map((m) => m.name).join(', ')}`
                        : 'Nenhuma migração para reverter.',
                );
                break;
            }
            case 'status': {
                const executed = await migrator.executed();
                const pending = await migrator.pending();
                console.log(`Aplicadas (${executed.length}):`);
                executed.forEach((m) => console.log(`  [x] ${m.name}`));
                console.log(`Pendentes (${pending.length}):`);
                pending.forEach((m) => console.log(`  - ${m.name}`));
                break;
            }
            case 'create': {
                const rawName = process.argv[3];
                if (!rawName) {
                    console.error('Informe o nome da migração: migrate create <nome>');
                    process.exitCode = 1;
                    break;
                }
                const name = rawName.endsWith('.ts') ? rawName : `${rawName}.ts`;
                await migrator.create({ name, prefix: 'TIMESTAMP' });
                break;
            }
            default:
                console.error(`Comando desconhecido: ${command}. Use up, down, status ou create.`);
                process.exitCode = 1;
        }
    } finally {
        await sequelize.close();
    }
}

main().catch((error) => {
    console.error('Falha ao executar migrações:', error);
    process.exit(1);
});
