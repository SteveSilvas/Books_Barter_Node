import { OAuth2Client } from 'google-auth-library';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { GoogleUserDTO } from '../@types/user';

const client = new OAuth2Client(env.auth.googleClientId || undefined);

/**
 * Valida um ID token do Google (Google Identity Services) e extrai os dados
 * do usuário. Lança 401 se o token for inválido ou não pertencer ao
 * `GOOGLE_CLIENT_ID` configurado.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserDTO> {
    if (!idToken) {
        throw new AppError('idToken é obrigatório.', StatusCodes.BAD_REQUEST);
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.auth.googleClientId || undefined,
        });
        const payload = ticket.getPayload();
        if (!payload?.email) {
            throw new Error('payload sem e-mail');
        }
        return {
            Name: payload.name ?? payload.email,
            Email: payload.email,
        };
    } catch {
        throw new AppError('Token do Google inválido.', StatusCodes.UNAUTHORIZED);
    }
}
