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
        expect(list.body.data[0].Category).toMatchObject({ Description: 'Romance' });
        expect(list.body.meta).toMatchObject({ total: 1, count: 1, hasMore: false });

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
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].Title).toBe('Dom Casmurro');
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
        expect(mine.body.data).toHaveLength(1);
        expect(mine.body.data[0].Title).toBe('Meu livro');
    });

    it('responde 401 sem token (estante é privada)', async () => {
        const res = await request(app).get('/users/me/books');
        expect(res.status).toBe(401);
    });
});

describe('Regra 4 — catálogo público (paginação, ordenação e filtros)', () => {
    it('lista apenas livros disponíveis no catálogo', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Disponível' });
        await createBook(categoryUuid, { Title: 'Reservado', Status: 'reserved' });

        const res = await request(app).get('/books');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].Title).toBe('Disponível');
        expect(res.body.meta).toMatchObject({ total: 1, count: 1, hasMore: false });
    });

    it('pagina com limit e offset e devolve metadados', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'A' });
        await createBook(categoryUuid, { Title: 'B' });
        await createBook(categoryUuid, { Title: 'C' });

        const first = await request(app).get('/books').query({ limit: 2, offset: 0 });
        expect(first.status).toBe(200);
        expect(first.body.data).toHaveLength(2);
        expect(first.body.meta).toMatchObject({
            limit: 2,
            offset: 0,
            total: 3,
            count: 2,
            hasMore: true,
        });

        const second = await request(app).get('/books').query({ limit: 2, offset: 2 });
        expect(second.body.data).toHaveLength(1);
        expect(second.body.meta).toMatchObject({ offset: 2, count: 1, hasMore: false });
    });

    it('rejeita limit/offset inválidos (400)', async () => {
        expect((await request(app).get('/books').query({ limit: 0 })).status).toBe(400);
        expect((await request(app).get('/books').query({ limit: 999 })).status).toBe(400);
        expect((await request(app).get('/books').query({ offset: -1 })).status).toBe(400);
    });

    it('ordena por título (asc/desc) e rejeita sort inválido (400)', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Beta' });
        await createBook(categoryUuid, { Title: 'Alfa' });

        const asc = await request(app).get('/books').query({ sort: 'Title', order: 'asc' });
        expect(asc.body.data.map((b: { Title: string }) => b.Title)).toEqual(['Alfa', 'Beta']);

        const desc = await request(app).get('/books').query({ sort: 'Title', order: 'desc' });
        expect(desc.body.data.map((b: { Title: string }) => b.Title)).toEqual(['Beta', 'Alfa']);

        expect((await request(app).get('/books').query({ sort: 'senha' })).status).toBe(400);
        expect((await request(app).get('/books').query({ order: 'cima' })).status).toBe(400);
    });

    it('filtra por categoria, status e dono', async () => {
        const romance = await createCategory('Romance');
        const ficcao = await createCategory('Ficção');
        await createBook(romance, { Title: 'R1' });
        await createBook(ficcao, { Title: 'F1' });
        await createBook(romance, { Title: 'R2 reservado', Status: 'reserved' });

        const byCategory = await request(app).get('/books').query({ categoryUuid: romance });
        expect(byCategory.body.data.map((b: { Title: string }) => b.Title)).toEqual(['R1']);

        const byStatus = await request(app)
            .get('/books')
            .query({ status: 'reserved' });
        expect(byStatus.body.data.map((b: { Title: string }) => b.Title)).toEqual([
            'R2 reservado',
        ]);

        expect((await request(app).get('/books').query({ status: 'x' })).status).toBe(400);

        const other = await registerAndLogin(app);
        await request(app)
            .post('/books')
            .set(bearer(other.token))
            .send({ Title: 'Do outro', Autor: 'Z', CategoryUuid: romance });

        const byOwner = await request(app).get('/books').query({ ownerUuid: other.Uuid });
        expect(byOwner.body.data.map((b: { Title: string }) => b.Title)).toEqual(['Do outro']);
    });

    it('estante pessoal mostra todos os status', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Disponível' });
        await createBook(categoryUuid, { Title: 'Trocado', Status: 'traded' });

        const mine = await request(app).get('/users/me/books').set(bearer(token));
        expect(mine.body.data).toHaveLength(2);
        expect(mine.body.meta).toMatchObject({ total: 2, count: 2, hasMore: false });
    });
});

describe('Regra 4 — estante pública de outro usuário', () => {
    it('expõe a estante pública de um usuário por uuid', async () => {
        const ana = await registerAndLogin(app, { Email: 'ana@example.com' });
        const categoryUuid = await createCategory();

        await request(app)
            .post('/books')
            .set(bearer(ana.token))
            .send({ Title: 'Da Ana', Autor: 'A', CategoryUuid: categoryUuid });
        await request(app)
            .post('/books')
            .set(bearer(ana.token))
            .send({ Title: 'Reservado da Ana', Autor: 'A', CategoryUuid: categoryUuid, Status: 'reserved' });
        await createBook(categoryUuid, { Title: 'Do principal' });

        const res = await request(app).get(`/users/${ana.Uuid}/books`);
        expect(res.status).toBe(200);
        expect(res.body.data.map((b: { Title: string }) => b.Title)).toEqual(['Da Ana']);
        expect(res.body.data[0].Owner).toEqual({ Name: 'Usuário Teste' });
        expect(res.body.data[0].UserId).toBeUndefined();
    });

    it('responde 400 para uuid inválido e 404 para usuário inexistente', async () => {
        expect((await request(app).get('/users/nao-e-uuid/books')).status).toBe(400);
        expect(
            (await request(app).get('/users/00000000-0000-4000-8000-000000000000/books'))
                .status,
        ).toBe(404);
    });

    it('pagina e ordena a estante pública', async () => {
        const ana = await registerAndLogin(app, { Email: 'ana@example.com' });
        const categoryUuid = await createCategory();
        for (const title of ['C', 'A', 'B']) {
            await request(app)
                .post('/books')
                .set(bearer(ana.token))
                .send({ Title: title, Autor: 'A', CategoryUuid: categoryUuid });
        }

        const res = await request(app)
            .get(`/users/${ana.Uuid}/books`)
            .query({ sort: 'Title', order: 'asc', limit: 2, offset: 1 });
        expect(res.status).toBe(200);
        expect(res.body.data.map((b: { Title: string }) => b.Title)).toEqual(['B', 'C']);
        expect(res.body.meta).toMatchObject({ total: 3, limit: 2, offset: 1, hasMore: false });
    });
});

describe('Regra 4 — bordas de paginação, ordenação e filtros', () => {
    it('usa os defaults (limit 20, offset 0, createdAt desc) quando nada é informado', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Primeiro' });
        await createBook(categoryUuid, { Title: 'Segundo' });

        const res = await request(app).get('/books');
        expect(res.status).toBe(200);
        expect(res.body.meta).toMatchObject({ limit: 20, offset: 0, total: 2 });
        // Ordem default: mais recente primeiro.
        expect(res.body.data.map((b: { Title: string }) => b.Title)).toEqual([
            'Segundo',
            'Primeiro',
        ]);
    });

    it('aceita os limites exatos (limit 1 e 50) e rejeita 51', async () => {
        const categoryUuid = await createCategory();
        await createBook(categoryUuid, { Title: 'Único' });

        expect((await request(app).get('/books').query({ limit: 1 })).status).toBe(200);
        expect((await request(app).get('/books').query({ limit: 50 })).status).toBe(200);
        expect((await request(app).get('/books').query({ limit: 51 })).status).toBe(400);
    });

    it('rejeita parâmetros repetidos (array) e vazios (400)', async () => {
        expect((await request(app).get('/books?limit=1&limit=2')).status).toBe(400);
        expect((await request(app).get('/books').query({ limit: '' })).status).toBe(400);
        expect((await request(app).get('/books').query({ title: '' })).status).toBe(400);
        expect((await request(app).get('/books').query({ limit: '2.5' })).status).toBe(400);
    });

    it('combina filtro, ordenação e paginação na mesma consulta', async () => {
        const romance = await createCategory('Romance');
        for (const title of ['A', 'B', 'C']) {
            await createBook(romance, { Title: title });
        }

        const res = await request(app)
            .get('/books')
            .query({ categoryUuid: romance, sort: 'Title', order: 'asc', limit: 1, offset: 1 });
        expect(res.status).toBe(200);
        expect(res.body.data.map((b: { Title: string }) => b.Title)).toEqual(['B']);
        expect(res.body.meta).toMatchObject({ total: 3, limit: 1, offset: 1, hasMore: true });
    });

    it('ignora livros de outros status mesmo filtrando por dono', async () => {
        const other = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        await request(app)
            .post('/books')
            .set(bearer(other.token))
            .send({ Title: 'Disponível do outro', Autor: 'A', CategoryUuid: categoryUuid });
        await request(app)
            .post('/books')
            .set(bearer(other.token))
            .send({ Title: 'Trocado do outro', Autor: 'A', CategoryUuid: categoryUuid, Status: 'traded' });

        const res = await request(app).get('/books').query({ ownerUuid: other.Uuid });
        expect(res.body.data.map((b: { Title: string }) => b.Title)).toEqual([
            'Disponível do outro',
        ]);
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
