import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<unknown>;

/**
 * Encapsula um handler assíncrono para que rejeições sejam encaminhadas
 * ao middleware de erro do Express, evitando try/catch repetidos.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        handler(req, res, next).catch(next);
    };
}
