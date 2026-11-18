import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';
import { parseId } from '../utils/parseId';

/**
 * Garante que o usuário autenticado só age sobre o próprio recurso.
 * Deve ser usado depois de `authenticate`.
 */
export function authorizeSelf(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const id = parseId(req.params.id);
    if (req.user?.Id !== id) {
        throw new AppError(
            'Você só pode alterar o seu próprio perfil.',
            StatusCodes.FORBIDDEN,
        );
    }
    next();
}
