import { Express } from 'express';
import request from 'supertest';
import { closeDatabase, createTestApp } from './helpers/app';
import { bearer, registerAndLogin } from './helpers/auth';

let app: Express;
let token: string;

afterAll(async () => {
    await closeDatabase();
});

beforeEach(async () => {
    app = await createTestApp();
    ({ token } = await registerAndLogin(app));
});

async function createCategory(description = 'Romance'): Promise<string> {
    const res = await request(app)
        .post('/categories')
        .set(bearer(token))
        .send({ Description: description });
    return res.body.Uuid as string;
}

async function createBook(
    categoryUuid: string,
    overrides: Partial<{ Title: string; Autor: string; Status: string }> = {},
): Promise<string> {
    const res = await request(app)
        .post('/books')
        .set(bearer(token))
        .send({
            Title: overrides.Title ?? 'Livro',
            Autor: overrides.Autor ?? 'Autor',
            CategoryUuid: categoryUuid,
            Status: overrides.Status,
        });
    return res.body.Uuid as string;
}

describe('Category', () => {
    it('cria uma categoria (201)', async () => {
        const res = await request(app)
            .post('/categories')
            .set(bearer(token))
            .send({ Description: 'Romance' });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ Description: 'Romance' });
        expect(typeof res.body.Uuid).toBe('string');
    });

    it('responde 401 ao criar sem token', async () => {
        const res = await request(app)
            .post('/categories')
            .send({ Description: 'Romance' });
        expect(res.status).toBe(401);
    });

    it('lista, busca por uuid e atualiza', async () => {
        const uuid = await createCategory();

        const list = await request(app).get('/categories');
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);

        const byUuid = await request(app).get(`/categories/${uuid}`);
        expect(byUuid.status).toBe(200);

        const updated = await request(app)
            .put(`/categories/${uuid}`)
            .set(bearer(token))
            .send({ Description: 'Romance BR' });
        expect(updated.status).toBe(200);
        expect(updated.body.Description).toBe('Romance BR');
    });

    it('remove (204) e responde 404 depois', async () => {
        const uuid = await createCategory();
        expect(
            (await request(app).delete(`/categories/${uuid}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/categories/${uuid}`)).status).toBe(404);
    });

    it('responde 400 para uuid inválido e 404 para inexistente', async () => {
        expect((await request(app).get('/categories/not-a-uuid')).status).toBe(400);
        expect(
            (await request(app).get('/categories/00000000-0000-4000-8000-000000000000'))
                .status,
        ).toBe(404);
    });
});

describe('Book (catálogo público)', () => {
    it('cria um livro vinculado a uma categoria e ao dono (201)', async () => {
        const categoryUuid = await createCategory();
        const res = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'Dom Casmurro',
                Autor: 'Machado de Assis',
                CategoryUuid: categoryUuid,
            });
        expect(res.status).toBe(201);
        expect(res.body.Title).toBe('Dom Casmurro');
        expect(res.body.Category).toMatchObject({ Uuid: categoryUuid, Description: 'Romance' });
        expect(res.body.Owner).toEqual({ Name: 'Usuário Teste' });
        expect(res.body.Status).toMatchObject({ Name: 'available' });
        expect(res.body.UserId).toBeUndefined();
        expect(res.body.Id).toBeUndefined();
    });

    it('responde 401 ao criar sem token', async () => {
        const res = await request(app)
            .post('/books')
            .send({ Title: 'X', Autor: 'Y', CategoryUuid: '00000000-0000-4000-8000-000000000000' });
        expect(res.status).toBe(401);
    });

    it('responde 404 ao criar com categoria inexistente', async () => {
        const res = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'X',
                Autor: 'Y',
                CategoryUuid: '00000000-0000-4000-8000-000000000000',
            });
        expect(res.status).toBe(404);
    });

    it('lista publicamente e atualiza parcialmente (dono)', async () => {
        const categoryUuid = await createCategory();
        const uuid = await createBook(categoryUuid, { Title: 'Livro' });

        const list = await request(app).get('/books');
        expect(list.status).toBe(200);
        expect(list.body[0].Category).toMatchObject({ Description: 'Romance' });

        const updated = await request(app)
            .put(`/books/${uuid}`)
            .set(bearer(token))
            .send({ Title: 'Livro 2' });
        expect(updated.status).toBe(200);
        expect(updated.body.Title).toBe('Livro 2');
        expect(updated.body.Autor).toBe('Autor');
    });

    it('pesquisa o catálogo público por título (parcial)', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Dom Casmurro' });
        await createBook(categoryUuid, { Title: 'Memórias Póstumas' });

        const res = await request(app).get('/books').query({ title: 'casmurro' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].Title).toBe('Dom Casmurro');
    });

    it('responde 403 ao editar ou remover livro de outro usuário', async () => {
        const categoryUuid = await createCategory();
        const uuid = await createBook(categoryUuid);
        const other = await registerAndLogin(app);

        const edit = await request(app)
            .put(`/books/${uuid}`)
            .set(bearer(other.token))
            .send({ Title: 'Invadido' });
        expect(edit.status).toBe(403);

        const del = await request(app)
            .delete(`/books/${uuid}`)
            .set(bearer(other.token));
        expect(del.status).toBe(403);
    });

    it('remove (204) o próprio livro', async () => {
        const categoryUuid = await createCategory();
        const uuid = await createBook(categoryUuid);
        expect(
            (await request(app).delete(`/books/${uuid}`).set(bearer(token))).status,
        ).toBe(204);
    });

    it('aceita status inicial e troca para reserved', async () => {
        const categoryUuid = await createCategory();
        const uuid = await createBook(categoryUuid, { Status: 'reserved' });
        const detail = await request(app).get(`/books/${uuid}`);
        expect(detail.body.Status.Name).toBe('reserved');

        const updated = await request(app)
            .put(`/books/${uuid}`)
            .set(bearer(token))
            .send({ Status: 'traded' });
        expect(updated.body.Status.Name).toBe('traded');
    });

    it('responde 400 para status inexistente', async () => {
        const categoryUuid = await createCategory();
        const res = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({ Title: 'X', Autor: 'Y', CategoryUuid: categoryUuid, Status: 'inexistente' });
        expect(res.status).toBe(400);
    });
});

describe('Estante pessoal (GET /users/me/books)', () => {
    it('lista apenas os livros do próprio usuário', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Meu livro' });

        const other = await registerAndLogin(app);
        await request(app)
            .post('/books')
            .set(bearer(other.token))
            .send({ Title: 'Livro do outro', Autor: 'Z', CategoryUuid: categoryUuid });

        const mine = await request(app).get('/users/me/books').set(bearer(token));
        expect(mine.status).toBe(200);
        expect(mine.body).toHaveLength(1);
        expect(mine.body[0].Title).toBe('Meu livro');
    });

    it('responde 401 sem token (estante é privada)', async () => {
        const res = await request(app).get('/users/me/books');
        expect(res.status).toBe(401);
    });
});

describe('BookCopy', () => {
    it('executa o ciclo CRUD completo', async () => {
        const payload = {
            ISBN: '978-000',
            Editora: 'Garnier',
            TypePrint: 'hardcover',
            PublicationDate: '1900-01-01',
            PublicationLocality: 'Rio de Janeiro',
        };

        const created = await request(app)
            .post('/book-copies')
            .set(bearer(token))
            .send(payload);
        expect(created.status).toBe(201);
        const uuid = created.body.Uuid;

        expect((await request(app).get('/book-copies')).status).toBe(200);
        expect((await request(app).get(`/book-copies/${uuid}`)).status).toBe(200);

        const updated = await request(app)
            .put(`/book-copies/${uuid}`)
            .set(bearer(token))
            .send({ Editora: 'Nova Editora' });
        expect(updated.status).toBe(200);
        expect(updated.body.Editora).toBe('Nova Editora');

        expect(
            (await request(app).delete(`/book-copies/${uuid}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/book-copies/${uuid}`)).status).toBe(404);
    });
});

describe('Address', () => {
    it('executa o ciclo CRUD completo', async () => {
        const payload = {
            Rua: 'Rua A',
            Numero: '10',
            Complemento: 'Apto 1',
            Bairro: 'Centro',
            Cep: 12345678,
            Cidade: 'São Paulo',
            Estado: 'SP',
            Pais: 'BR',
        };

        const created = await request(app)
            .post('/addresses')
            .set(bearer(token))
            .send(payload);
        expect(created.status).toBe(201);
        const uuid = created.body.Uuid;

        expect((await request(app).get('/addresses')).status).toBe(200);

        const updated = await request(app)
            .put(`/addresses/${uuid}`)
            .set(bearer(token))
            .send({ Cidade: 'Campinas' });
        expect(updated.status).toBe(200);
        expect(updated.body.Cidade).toBe('Campinas');
        expect(updated.body.Estado).toBe('SP');

        expect(
            (await request(app).delete(`/addresses/${uuid}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/addresses/${uuid}`)).status).toBe(404);
    });
});
