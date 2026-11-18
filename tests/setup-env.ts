import os from 'os';
import path from 'path';

/**
 * Define as variáveis de ambiente antes de qualquer módulo da aplicação ser
 * carregado. Os testes usam SQLite em arquivo temporário para não exigir um
 * servidor MySQL em execução.
 */
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = path.join(os.tmpdir(), `escambo-test-${process.pid}.sqlite`);
process.env.PORT = '0';
