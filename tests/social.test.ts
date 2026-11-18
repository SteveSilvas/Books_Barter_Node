import { Express } from 'express';
import request from 'supertest';
import { closeDatabase, createTestApp } from './helpers/app';
import { bearer, registerAndLogin } from './helpers/auth';

let app: Express;
let token: string;
let uuid: string;

afterAll(async () => {
    await closeDatabase();
});

beforeEach(async () => {
    app = await createTestApp();
    ({ token, Uuid: uuid } = await registerAndLogin(app));
});

describe('Regra 5 — seguir e deixar de seguir', () => {
    it('segue e deixa de seguir um usuário', async () => {
        const bob = await registerAndLogin(app);

        expect(
            (await request(app).post(`/users/${bob.Uuid}/follow`).set(bearer(token)))
                .status,
        ).toBe(204);

        const followers = await request(app).get(`/users/${bob.Uuid}/followers`);
        expect(followers.status).toBe(200);
        expect(followers.body.data.map((u: { Uuid: string }) => u.Uuid)).toEqual([uuid]);
        expect(followers.body.meta).toMatchObject({ total: 1, count: 1, hasMore: false });

        const following = await request(app).get(`/users/${uuid}/following`);
        expect(following.body.data.map((u: { Uuid: string }) => u.Uuid)).toEqual([
            bob.Uuid,
        ]);

        expect(
            (await request(app).delete(`/users/${bob.Uuid}/follow`).set(bearer(token)))
                .status,
        ).toBe(204);
        expect(
            (await request(app).get(`/users/${bob.Uuid}/followers`)).body.meta.total,
        ).toBe(0);
    });

    it('rejeita seguir a si mesmo (400)', async () => {
        const res = await request(app).post(`/users/${uuid}/follow`).set(bearer(token));
        expect(res.status).toBe(400);
    });

    it('rejeita seguir duas vezes (409)', async () => {
        const bob = await registerAndLogin(app);
        await request(app).post(`/users/${bob.Uuid}/follow`).set(bearer(token));
        const res = await request(app).post(`/users/${bob.Uuid}/follow`).set(bearer(token));
        expect(res.status).toBe(409);
    });

    it('rejeita deixar de seguir quem não segue (404)', async () => {
        const bob = await registerAndLogin(app);
        const res = await request(app).delete(`/users/${bob.Uuid}/follow`).set(bearer(token));
        expect(res.status).toBe(404);
    });

    it('exige autenticação para seguir (401)', async () => {
        const bob = await registerAndLogin(app);
        expect((await request(app).post(`/users/${bob.Uuid}/follow`)).status).toBe(401);
    });

    it('retorna 404 para alvo inexistente e 400 para uuid inválido', async () => {
        const missing = '00000000-0000-4000-8000-000000000000';
        expect(
            (await request(app).post(`/users/${missing}/follow`).set(bearer(token))).status,
        ).toBe(404);
        expect(
            (await request(app).post('/users/nao-e-uuid/follow').set(bearer(token))).status,
        ).toBe(400);
    });

    it('expõe contadores de seguidores e seguindo no perfil público', async () => {
        const bob = await registerAndLogin(app);
        const carl = await registerAndLogin(app);

        await request(app).post(`/users/${carl.Uuid}/follow`).set(bearer(token));
        await request(app).post(`/users/${carl.Uuid}/follow`).set(bearer(bob.token));

        const profile = await request(app).get(`/users/${carl.Uuid}`);
        expect(profile.body).toMatchObject({ followersCount: 2, followingCount: 0 });

        const mine = await request(app).get(`/users/${uuid}`);
        expect(mine.body).toMatchObject({ followersCount: 0, followingCount: 1 });
    });

    it('pagina e ordena as listagens de relacionamento', async () => {
        const carl = await registerAndLogin(app);
        for (const name of ['Ana', 'Bruno', 'Carla']) {
            const u = await registerAndLogin(app, { Name: name });
            await request(app).post(`/users/${carl.Uuid}/follow`).set(bearer(u.token));
        }

        const res = await request(app)
            .get(`/users/${carl.Uuid}/followers`)
            .query({ sort: 'Name', order: 'asc', limit: 2, offset: 0 });
        expect(res.status).toBe(200);
        expect(res.body.data.map((u: { Name: string }) => u.Name)).toEqual([
            'Ana',
            'Bruno',
        ]);
        expect(res.body.meta).toMatchObject({ total: 3, limit: 2, hasMore: true });

        expect(
            (await request(app).get(`/users/${carl.Uuid}/followers`).query({ sort: 'x' }))
                .status,
        ).toBe(400);
        expect(
            (await request(app).get(`/users/${carl.Uuid}/followers`).query({ order: 'cima' }))
                .status,
        ).toBe(400);
    });

    it('distingue seguidores de seguindo em ambos os lados', async () => {
        const bob = await registerAndLogin(app, { Name: 'Bob' });
        await request(app).post(`/users/${bob.Uuid}/follow`).set(bearer(token));

        const bobFollowers = await request(app).get(`/users/${bob.Uuid}/followers`);
        const bobFollowing = await request(app).get(`/users/${bob.Uuid}/following`);
        const myFollowers = await request(app).get(`/users/${uuid}/followers`);
        const myFollowing = await request(app).get(`/users/${uuid}/following`);

        expect(bobFollowers.body.data.map((u: { Uuid: string }) => u.Uuid)).toEqual([uuid]);
        expect(bobFollowing.body.meta.total).toBe(0);
        expect(myFollowers.body.meta.total).toBe(0);
        expect(myFollowing.body.data.map((u: { Uuid: string }) => u.Uuid)).toEqual([
            bob.Uuid,
        ]);
    });

    it('as listagens de relacionamento são públicas, mas as ações exigem token (401)', async () => {
        const bob = await registerAndLogin(app);
        expect((await request(app).get(`/users/${bob.Uuid}/followers`)).status).toBe(200);
        expect((await request(app).get(`/users/${bob.Uuid}/following`)).status).toBe(200);
        expect((await request(app).delete(`/users/${bob.Uuid}/follow`)).status).toBe(401);
    });

    it('responde 404/400 ao listar relacionamentos de usuário inexistente/inválido', async () => {
        const missing = '00000000-0000-4000-8000-000000000000';
        expect((await request(app).get(`/users/${missing}/followers`)).status).toBe(404);
        expect((await request(app).get(`/users/${missing}/following`)).status).toBe(404);
        expect((await request(app).get('/users/nao-e-uuid/followers')).status).toBe(400);
    });
});

describe('Regra 6 — favoritar estantes e livros', () => {
    async function createCategory(): Promise<string> {
        const res = await request(app)
            .post('/categories')
            .set(bearer(token))
            .send({ Description: 'Romance' });
        return res.body.Uuid as string;
    }

    async function createBook(
        authToken: string,
        categoryUuid: string,
        title: string,
    ): Promise<string> {
        const res = await request(app)
            .post('/books')
            .set(bearer(authToken))
            .send({ Title: title, Autor: 'A', CategoryUuid: categoryUuid });
        return res.body.Uuid as string;
    }

    it('favorita e desfavorita a estante de outro usuário', async () => {
        const bob = await registerAndLogin(app);

        expect(
            (await request(app).post(`/users/${bob.Uuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(204);

        const list = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(token));
        expect(list.status).toBe(200);
        expect(list.body.data.map((u: { Uuid: string }) => u.Uuid)).toEqual([bob.Uuid]);

        expect(
            (await request(app).delete(`/users/${bob.Uuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(204);
        expect(
            (await request(app).get('/users/me/favorites/shelves').set(bearer(token))).body
                .meta.total,
        ).toBe(0);
    });

    it('favorita e desfavorita um livro', async () => {
        const bob = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        const bookUuid = await createBook(bob.token, categoryUuid, 'Livro do Bob');

        expect(
            (await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(204);

        const list = await request(app)
            .get('/users/me/favorites/books')
            .set(bearer(token));
        expect(list.body.data).toHaveLength(1);
        expect(list.body.data[0]).toMatchObject({
            Uuid: bookUuid,
            Title: 'Livro do Bob',
            Owner: { Name: 'Usuário Teste' },
        });
        expect(list.body.data[0].FavoritedAt).toBeDefined();
        expect(list.body.data[0].UserId).toBeUndefined();

        expect(
            (await request(app).delete(`/books/${bookUuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(204);
    });

    it('rejeita favoritar a própria estante e o próprio livro (400)', async () => {
        const categoryUuid = await createCategory();
        const ownBook = await createBook(token, categoryUuid, 'Meu livro');

        expect(
            (await request(app).post(`/users/${uuid}/favorite`).set(bearer(token))).status,
        ).toBe(400);
        expect(
            (await request(app).post(`/books/${ownBook}/favorite`).set(bearer(token))).status,
        ).toBe(400);
    });

    it('estante e livro favoritados são registros independentes', async () => {
        const bob = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        const bookUuid = await createBook(bob.token, categoryUuid, 'Livro do Bob');

        // Favorita só o livro: a estante do Bob não entra na lista.
        await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token));
        let shelves = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(token));
        let books = await request(app).get('/users/me/favorites/books').set(bearer(token));
        expect(shelves.body.meta.total).toBe(0);
        expect(books.body.meta.total).toBe(1);

        // Desfavoritar o livro não mexe na estante favoritada depois.
        await request(app).post(`/users/${bob.Uuid}/favorite`).set(bearer(token));
        await request(app).delete(`/books/${bookUuid}/favorite`).set(bearer(token));
        shelves = await request(app).get('/users/me/favorites/shelves').set(bearer(token));
        books = await request(app).get('/users/me/favorites/books').set(bearer(token));
        expect(shelves.body.meta.total).toBe(1);
        expect(books.body.meta.total).toBe(0);
    });

    it('ordena os favoritos (allowlist) e rejeita campos não suportados (400)', async () => {
        const categoryUuid = await createCategory();
        for (const name of ['Ana', 'Bruno']) {
            const owner = await registerAndLogin(app, { Name: name });
            await request(app).post(`/users/${owner.Uuid}/favorite`).set(bearer(token));
            const bookUuid = await createBook(owner.token, categoryUuid, `Livro ${name}`);
            await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token));
        }

        // Ordenação por nome do dono (estantes).
        const byName = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(token))
            .query({ sort: 'Name', order: 'asc' });
        expect(byName.status).toBe(200);
        expect(byName.body.data.map((u: { Name: string }) => u.Name)).toEqual([
            'Ana',
            'Bruno',
        ]);

        // Livros favoritados só aceitam createdAt/updatedAt; Title/Autor não existem aqui.
        const byCreated = await request(app)
            .get('/users/me/favorites/books')
            .set(bearer(token))
            .query({ sort: 'createdAt', order: 'desc' });
        expect(byCreated.status).toBe(200);
        expect(byCreated.body.data).toHaveLength(2);
        expect(
            (await request(app)
                .get('/users/me/favorites/books')
                .set(bearer(token))
                .query({ sort: 'Title' })).status,
        ).toBe(400);
    });

    it('rejeita favoritar duas vezes (409)', async () => {
        const bob = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        const bookUuid = await createBook(bob.token, categoryUuid, 'Livro do Bob');

        await request(app).post(`/users/${bob.Uuid}/favorite`).set(bearer(token));
        expect(
            (await request(app).post(`/users/${bob.Uuid}/favorite`).set(bearer(token))).status,
        ).toBe(409);

        await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token));
        expect(
            (await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token))).status,
        ).toBe(409);
    });

    it('rejeita desfavoritar o que não foi favoritado (404)', async () => {
        const bob = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        const bookUuid = await createBook(bob.token, categoryUuid, 'Livro do Bob');

        expect(
            (await request(app).delete(`/users/${bob.Uuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(404);
        expect(
            (await request(app).delete(`/books/${bookUuid}/favorite`).set(bearer(token)))
                .status,
        ).toBe(404);
    });

    it('exige autenticação e retorna 404 para alvos inexistentes', async () => {
        const bob = await registerAndLogin(app);
        const missing = '00000000-0000-4000-8000-000000000000';

        expect((await request(app).post(`/users/${bob.Uuid}/favorite`)).status).toBe(401);
        expect((await request(app).delete(`/users/${bob.Uuid}/favorite`)).status).toBe(401);
        expect((await request(app).post(`/books/${missing}/favorite`)).status).toBe(401);
        expect((await request(app).get('/users/me/favorites/shelves')).status).toBe(401);
        expect(
            (await request(app).get('/users/me/favorites/books')).status,
        ).toBe(401);
        expect(
            (await request(app).post(`/books/${missing}/favorite`).set(bearer(token))).status,
        ).toBe(404);
    });

    it('rejeita uuid inválido (400) em favoritar e desfavoritar', async () => {
        expect(
            (await request(app).post('/users/nao-e-uuid/favorite').set(bearer(token))).status,
        ).toBe(400);
        expect(
            (await request(app).delete('/users/nao-e-uuid/favorite').set(bearer(token))).status,
        ).toBe(400);
        expect(
            (await request(app).post('/books/nao-e-uuid/favorite').set(bearer(token))).status,
        ).toBe(400);
        expect(
            (await request(app).delete('/books/nao-e-uuid/favorite').set(bearer(token))).status,
        ).toBe(400);
    });

    it('mantém os favoritos isolados por usuário', async () => {
        const bob = await registerAndLogin(app);
        const categoryUuid = await createCategory();
        const bookUuid = await createBook(bob.token, categoryUuid, 'Livro do Bob');

        await request(app).post(`/users/${bob.Uuid}/favorite`).set(bearer(token));
        await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token));

        const mine = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(token));
        expect(mine.body.meta.total).toBe(1);

        // O próprio Bob (outro token) não herda os favoritos do usuário principal.
        const bobOwn = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(bob.token));
        const bobBooks = await request(app)
            .get('/users/me/favorites/books')
            .set(bearer(bob.token));
        expect(bobOwn.body.meta.total).toBe(0);
        expect(bobBooks.body.meta.total).toBe(0);
    });

    it('lista estantes e livros favoritados com paginação', async () => {
        const categoryUuid = await createCategory();
        for (const name of ['Ana', 'Bruno']) {
            const owner = await registerAndLogin(app, { Name: name });
            await request(app).post(`/users/${owner.Uuid}/favorite`).set(bearer(token));
            const bookUuid = await createBook(owner.token, categoryUuid, `Livro ${name}`);
            await request(app).post(`/books/${bookUuid}/favorite`).set(bearer(token));
        }

        const shelves = await request(app)
            .get('/users/me/favorites/shelves')
            .set(bearer(token))
            .query({ limit: 1, offset: 0 });
        expect(shelves.body.data).toHaveLength(1);
        expect(shelves.body.meta).toMatchObject({ total: 2, limit: 1, hasMore: true });

        const books = await request(app)
            .get('/users/me/favorites/books')
            .set(bearer(token))
            .query({ limit: 10 });
        expect(books.body.data).toHaveLength(2);
        expect(books.body.meta).toMatchObject({ total: 2, count: 2, hasMore: false });
    });
});
