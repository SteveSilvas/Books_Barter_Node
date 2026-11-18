import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

export interface ErrorBody {
    status: number;
    message: string;
}

/**
 * Middleware central de erros: traduz AppError para o código HTTP adequado
 * e qualquer erro inesperado para 500.
 */
export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): Response<ErrorBody> {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor.',
    });
}
