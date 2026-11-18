import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';
import { parseUuid } from '../utils/parseId';

/**
 * Garante que o usuário autenticado só age sobre o próprio recurso
 * (`/users/:uuid`). Deve ser usado depois de `authenticate`.
 */
export function authorizeSelf(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const uuid = parseUuid(req.params.uuid);
    if (req.user?.Uuid !== uuid) {
        throw new AppError(
            'Você só pode alterar o seu próprio perfil.',
            StatusCodes.FORBIDDEN,
        );
    }
    next();
}
