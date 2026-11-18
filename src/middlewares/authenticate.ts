import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware de autenticação: exige um header `Authorization: Bearer <token>`
 * válido e disponibiliza o usuário autenticado em `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw new AppError(
            'Token de autenticação ausente.',
            StatusCodes.UNAUTHORIZED,
        );
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyToken(token);
    req.user = { Id: payload.sub, Uuid: payload.uuid, Email: payload.email };
    next();
}
