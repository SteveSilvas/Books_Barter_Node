import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorBody } from './errorHandler';

export function notFoundHandler(
    req: Request,
    res: Response,
    _next: NextFunction,
): Response<ErrorBody> {
    return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    });
}
