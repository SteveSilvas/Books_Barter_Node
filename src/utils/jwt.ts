import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

export interface TokenPayload {
    sub: number;
    email: string;
}

/** Assina um JWT com o id e o e-mail do usuário. */
export function signToken(payload: TokenPayload): string {
    const options: SignOptions = {
        expiresIn: env.auth.jwtExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.auth.jwtSecret, options);
}

/** Valida um JWT e devolve o payload; lança 401 se inválido/expirado. */
export function verifyToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, env.auth.jwtSecret);
        if (typeof decoded === 'string') {
            throw new Error('payload inesperado');
        }
        return { sub: Number(decoded.sub), email: String(decoded.email) };
    } catch {
        throw new AppError('Token inválido ou expirado.', StatusCodes.UNAUTHORIZED);
    }
}
