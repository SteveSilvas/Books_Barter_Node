import { StatusCodes } from 'http-status-codes';

/**
 * Erro de aplicação com um código HTTP associado.
 * Lançado pelas camadas de serviço e traduzido pelo middleware de erro.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number = StatusCodes.BAD_REQUEST) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}
