import { Express } from 'express';
import request from 'supertest';
import { createTestApp, closeDatabase } from './helpers/app';
import { bearer, registerAndLogin } from './helpers/auth';

let app: Express;

afterAll(async () => {
    await closeDatabase();
});

beforeEach(async () => {
    app = await createTestApp();
});

const validUser = {
    Name: 'Ana',
    Birth: '1990-05-01',
    Email: 'ana@example.com',
    Pass: 'secret',
};

describe('GET /status', () => {
    it('responde 200 com o status da API', async () => {
        const res = await request(app).get('/status');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok', message: 'API em funcionamento.' });
    });
});

describe('POST /users', () => {
    it('cria um usuário e responde 201', async () => {
        const res = await request(app).post('/users').send(validUser);
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            Id: expect.any(Number),
            Name: 'Ana',
            Email: 'ana@example.com',
        });
    });

    it('não expõe a senha na resposta', async () => {
        const res = await request(app).post('/users').send(validUser);
        expect(res.body.Pass).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toContain('secret');
    });

    it('armazena a senha com hash (não em texto puro)', async () => {
        await request(app).post('/users').send(validUser);
        const { User } = await import('../src/models');
        const stored = await User.findOne({ where: { Email: 'ana@example.com' } });
        expect(stored?.Pass).toBeDefined();
        expect(stored?.Pass).not.toBe('secret');
        expect(stored?.Pass).toMatch(/^\$2[aby]\$/);
    });

    it('responde 409 ao cadastrar e-mail duplicado', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app).post('/users').send(validUser);
        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({ status: 409 });
    });
});

describe('GET /users', () => {
    it('lista os usuários cadastrados', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app).get('/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
    });
});

describe('GET /users/:id', () => {
    it('retorna o usuário pelo id', async () => {
        const created = await request(app).post('/users').send(validUser);
        const res = await request(app).get(`/users/${created.body.Id}`);
        expect(res.status).toBe(200);
        expect(res.body.Email).toBe('ana@example.com');
    });

    it('responde 404 para id inexistente', async () => {
        const res = await request(app).get('/users/9999');
        expect(res.status).toBe(404);
    });

    it('responde 400 para id não numérico', async () => {
        const res = await request(app).get('/users/abc');
        expect(res.status).toBe(400);
    });
});

describe('GET /users/email/:email', () => {
    it('retorna o usuário pelo e-mail', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app).get('/users/email/ana@example.com');
        expect(res.status).toBe(200);
        expect(res.body.Name).toBe('Ana');
    });
});

describe('POST /users/login', () => {
    it('autentica com credenciais válidas (200) e devolve token', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app)
            .post('/users/login')
            .send({ Email: 'ana@example.com', Pass: 'secret' });
        expect(res.status).toBe(200);
        expect(res.body.data.Email).toBe('ana@example.com');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(0);
    });

    it('responde 401 com senha incorreta', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app)
            .post('/users/login')
            .send({ Email: 'ana@example.com', Pass: 'errada' });
        expect(res.status).toBe(401);
    });

    it('responde 401 para e-mail inexistente', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ Email: 'nao@existe.com', Pass: 'x' });
        expect(res.status).toBe(401);
    });
});

describe('GET /users/me', () => {
    it('retorna o perfil do usuário autenticado (200)', async () => {
        const { token, Email } = await registerAndLogin(app, validUser);
        const res = await request(app).get('/users/me').set(bearer(token));
        expect(res.status).toBe(200);
        expect(res.body.Email).toBe(Email);
        expect(res.body.Pass).toBeUndefined();
    });

    it('responde 401 sem token', async () => {
        const res = await request(app).get('/users/me');
        expect(res.status).toBe(401);
    });

    it('responde 401 com token inválido', async () => {
        const res = await request(app).get('/users/me').set(bearer('token.invalido'));
        expect(res.status).toBe(401);
    });
});

describe('POST /users/google', () => {
    it('responde 400 sem idToken', async () => {
        const res = await request(app).post('/users/google').send({});
        expect(res.status).toBe(400);
    });

    it('responde 401 com idToken inválido', async () => {
        const res = await request(app)
            .post('/users/google')
            .send({ idToken: 'token-falso' });
        expect(res.status).toBe(401);
    });
});

describe('PUT /users/:id', () => {
    it('atualiza parcialmente e responde 200', async () => {
        const { token, Id } = await registerAndLogin(app, validUser);
        const res = await request(app)
            .put(`/users/${Id}`)
            .set(bearer(token))
            .send({ Name: 'Ana Maria' });
        expect(res.status).toBe(200);
        expect(res.body.Name).toBe('Ana Maria');
        expect(res.body.Email).toBe('ana@example.com');
    });

    it('responde 401 sem token', async () => {
        const created = await request(app).post('/users').send(validUser);
        const res = await request(app)
            .put(`/users/${created.body.Id}`)
            .send({ Name: 'X' });
        expect(res.status).toBe(401);
    });

    it('responde 409 ao atualizar para e-mail já usado', async () => {
        const { token, Id } = await registerAndLogin(app, validUser);
        await request(app)
            .post('/users')
            .send({ ...validUser, Email: 'bob@example.com' });
        const res = await request(app)
            .put(`/users/${Id}`)
            .set(bearer(token))
            .send({ Email: 'bob@example.com' });
        expect(res.status).toBe(409);
    });

    it('responde 404 para usuário inexistente', async () => {
        const { token } = await registerAndLogin(app, validUser);
        const res = await request(app)
            .put('/users/9999')
            .set(bearer(token))
            .send({ Name: 'X' });
        expect(res.status).toBe(404);
    });
});

describe('DELETE /users/:id', () => {
    it('remove o usuário e responde 204', async () => {
        const { token, Id } = await registerAndLogin(app, validUser);
        const res = await request(app).delete(`/users/${Id}`).set(bearer(token));
        expect(res.status).toBe(204);
        expect(res.body).toEqual({});
    });

    it('responde 401 sem token', async () => {
        const created = await request(app).post('/users').send(validUser);
        const res = await request(app).delete(`/users/${created.body.Id}`);
        expect(res.status).toBe(401);
    });

    it('responde 404 ao remover novamente', async () => {
        const { token, Id } = await registerAndLogin(app, validUser);
        await request(app).delete(`/users/${Id}`).set(bearer(token));
        const res = await request(app).delete(`/users/${Id}`).set(bearer(token));
        expect(res.status).toBe(404);
    });
});

describe('rotas inexistentes', () => {
    it('responde 404 para rota desconhecida', async () => {
        const res = await request(app).get('/nao-existe');
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({ status: 404 });
    });
});
