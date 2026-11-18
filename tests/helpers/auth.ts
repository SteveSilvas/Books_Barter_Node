import { Express } from 'express';
import request from 'supertest';

export interface AuthContext {
    token: string;
    Id: number;
    Email: string;
}

/**
 * Cadastra um usuário e faz login, devolvendo o token JWT para usar em
 * requisições autenticadas.
 */
export async function registerAndLogin(
    app: Express,
    overrides: Partial<{ Name: string; Email: string; Pass: string; Birth: string }> = {},
): Promise<AuthContext> {
    const Email = overrides.Email ?? `user-${Date.now()}-${Math.random()}@example.com`;
    const Pass = overrides.Pass ?? 'secret';

    await request(app).post('/users').send({
        Name: overrides.Name ?? 'Usuário Teste',
        Birth: overrides.Birth ?? '1990-01-01',
        Email,
        Pass,
    });

    const login = await request(app).post('/users/login').send({ Email, Pass });
    return { token: login.body.token, Id: login.body.data.Id, Email };
}

/** Monta o header Authorization a partir de um token. */
export function bearer(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
}
