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

async function createCategory(description = 'Romance'): Promise<number> {
    const res = await request(app)
        .post('/categories')
        .set(bearer(token))
        .send({ Description: description });
    return res.body.Id as number;
}

describe('Category', () => {
    it('cria uma categoria (201)', async () => {
        const res = await request(app)
            .post('/categories')
            .set(bearer(token))
            .send({ Description: 'Romance' });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ Description: 'Romance' });
    });

    it('responde 401 ao criar sem token', async () => {
        const res = await request(app)
            .post('/categories')
            .send({ Description: 'Romance' });
        expect(res.status).toBe(401);
    });

    it('lista, busca por id e atualiza', async () => {
        const id = await createCategory();

        const list = await request(app).get('/categories');
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);

        const byId = await request(app).get(`/categories/${id}`);
        expect(byId.status).toBe(200);

        const updated = await request(app)
            .put(`/categories/${id}`)
            .set(bearer(token))
            .send({ Description: 'Romance BR' });
        expect(updated.status).toBe(200);
        expect(updated.body.Description).toBe('Romance BR');
    });

    it('remove (204) e responde 404 depois', async () => {
        const id = await createCategory();
        expect(
            (await request(app).delete(`/categories/${id}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/categories/${id}`)).status).toBe(404);
    });

    it('responde 404 para id inexistente', async () => {
        expect((await request(app).get('/categories/9999')).status).toBe(404);
    });
});

describe('Book', () => {
    it('cria um livro vinculado a uma categoria (201)', async () => {
        const categoryId = await createCategory();
        const res = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'Dom Casmurro',
                Autor: 'Machado de Assis',
                CategoryId: categoryId,
            });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            Title: 'Dom Casmurro',
            CategoryId: categoryId,
        });
    });

    it('responde 401 ao criar sem token', async () => {
        const res = await request(app)
            .post('/books')
            .send({ Title: 'X', Autor: 'Y', CategoryId: 1 });
        expect(res.status).toBe(401);
    });

    it('responde 404 ao criar com categoria inexistente', async () => {
        const res = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'X',
                Autor: 'Y',
                CategoryId: 9999,
            });
        expect(res.status).toBe(404);
    });

    it('lista com a categoria incluída e atualiza parcialmente', async () => {
        const categoryId = await createCategory();
        const created = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'Livro',
                Autor: 'Autor',
                CategoryId: categoryId,
            });

        const list = await request(app).get('/books');
        expect(list.status).toBe(200);
        expect(list.body[0].Category).toMatchObject({ Description: 'Romance' });

        const updated = await request(app)
            .put(`/books/${created.body.Id}`)
            .set(bearer(token))
            .send({ Title: 'Livro 2' });
        expect(updated.status).toBe(200);
        expect(updated.body.Title).toBe('Livro 2');
        expect(updated.body.Autor).toBe('Autor');
    });

    it('remove (204)', async () => {
        const categoryId = await createCategory();
        const created = await request(app)
            .post('/books')
            .set(bearer(token))
            .send({
                Title: 'Livro',
                Autor: 'Autor',
                CategoryId: categoryId,
            });
        expect(
            (await request(app).delete(`/books/${created.body.Id}`).set(bearer(token)))
                .status,
        ).toBe(204);
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
        const id = created.body.Id;

        expect((await request(app).get('/book-copies')).status).toBe(200);
        expect((await request(app).get(`/book-copies/${id}`)).status).toBe(200);

        const updated = await request(app)
            .put(`/book-copies/${id}`)
            .set(bearer(token))
            .send({ Editora: 'Nova Editora' });
        expect(updated.status).toBe(200);
        expect(updated.body.Editora).toBe('Nova Editora');

        expect(
            (await request(app).delete(`/book-copies/${id}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/book-copies/${id}`)).status).toBe(404);
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
        const id = created.body.Id;

        expect((await request(app).get('/addresses')).status).toBe(200);

        const updated = await request(app)
            .put(`/addresses/${id}`)
            .set(bearer(token))
            .send({ Cidade: 'Campinas' });
        expect(updated.status).toBe(200);
        expect(updated.body.Cidade).toBe('Campinas');
        expect(updated.body.Estado).toBe('SP');

        expect(
            (await request(app).delete(`/addresses/${id}`).set(bearer(token))).status,
        ).toBe(204);
        expect((await request(app).get(`/addresses/${id}`)).status).toBe(404);
    });
});
