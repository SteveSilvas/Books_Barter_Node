# 📚 Books Barter Node — API de Escambo de Livros

API REST em **Node.js + TypeScript** que dá suporte à plataforma de **escambo (troca) de livros**
entre leitores. Este repositório contém **apenas o backend**.

> Este é um **sub-repositório** do projeto [**Books Barter / EscamboLiterário**](https://github.com/SteveSilvas/Books_Barter).
> A **proposta**, as **regras gerais de negócio** e a **documentação de arquitetura e especificação**
> ficam no repositório principal. Aqui você encontra o que é específico da API: **como rodar**,
> endpoints, modelos de dados, testes e decisões de implementação.

* 🌐 Repositório principal: [SteveSilvas/Books_Barter](https://github.com/SteveSilvas/Books_Barter)
* 📱 App mobile: [SteveSilvas/Livro_Por_Livro_React_Native](https://github.com/SteveSilvas/Livro_Por_Livro_React_Native)
* 📄 Especificação da API: [docs/spec.md](https://github.com/SteveSilvas/Books_Barter/blob/main/docs/spec.md)
* 🏗️ Arquitetura: [docs/architecture.md](https://github.com/SteveSilvas/Books_Barter/blob/main/docs/architecture.md)

> O pacote está registrado como `escambo-literario-api` no `package.json`.
>
> 📌 **Planejamento:** o andamento (feito × pendente) e a estratégia **Code First** estão em
> [`ROADMAP.md`](./ROADMAP.md).

---

## ✅ Cobertura das regras de negócio

A API implementa as regras gerais definidas no repositório principal. Resumo do status:

**Legenda:** ✅ implementado · 🟡 parcial · 🔴 pendente.

| # | Regra de negócio | Status | O que existe no código hoje |
|---|------------------|--------|------------------------------|
| 1 | Acesso autenticado | ✅ Implementado | Cadastro (`POST /users`), login por e-mail/senha (`POST /users/login`) e login com Google (`POST /users/google`). Senhas com **hash (bcrypt)**, sessão por **JWT** (`Authorization: Bearer <token>`) e rotas de escrita protegidas pelo middleware `authenticate`. |
| 2 | Ver e editar perfil | ✅ Implementado | `GET /users/me` (perfil próprio) e `PUT /users/me` (edição parcial com validação de nome/e-mail/data). Troca de senha exige a senha atual. `PUT/DELETE /users/:uuid` só permitem o **próprio** usuário (403 caso contrário). Perfis de terceiros são públicos **sem e-mail**. |
| 3 | Estante digital | ✅ Implementado | Cada livro tem dono (`Book.UserId`) e status. **Estante pessoal privada** em `GET /users/me/books` (só o dono) e **catálogo público** em `GET /books?title=` (ver e pesquisar). CRUD do livro restrito ao dono (403 caso contrário). |
| 4 | Visibilidade da estante de outros | ✅ Implementado | Catálogo público **paginado** (`?limit&offset`), **ordenável** (`?sort&order`) e **filtrável** (`?title&categoryUuid&status&ownerUuid`), listando só livros `available`. Estante pública de terceiros em `GET /users/:uuid/books`. Respostas em envelope `{ data, meta }`, sem expor `UserId`. |
| 5 | Seguir / deixar de seguir | ✅ Implementado | Model `Follow` (`FollowerId`/`FollowingId`, par único). `POST/DELETE /users/:uuid/follow` (🔒) e listagens `GET /users/:uuid/followers` e `/following` (paginadas). Não seguir a si mesmo (400), duplicado (409). Contadores `followersCount`/`followingCount` no perfil público. |
| 6 | Favoritar / desfavoritar | ✅ Implementado | Duas entidades: `FavoriteShelf` (estante) e `FavoriteBook` (livro). `POST/DELETE /users/:uuid/favorite` e `POST/DELETE /books/:uuid/favorite` (🔒). Listagens privadas `GET /users/me/favorites/shelves` e `/books` (paginadas). Não favoritar o próprio item (400), duplicado (409). |
| 7 | Chat de negociação | 🔴 Pendente | Não implementado (sem entidades de conversa/mensagem). |

### Recursos de apoio já disponíveis

Além do núcleo de usuários/livros, a API já expõe CRUD completo (tipado e com status HTTP corretos)
para os recursos de apoio que essas regras vão consumir:

* **`Category`** — categorias de livros (`/categories`), usadas na classificação dos livros.
* **`BookCopy`** — exemplares físicos dos livros (`/book-copies`), base para a logística de escambo.
* **`Address`** — endereços (`/addresses`), úteis para a negociação/logística de troca.

---

## 🧱 Arquitetura e separação de responsabilidades

O código segue uma arquitetura em camadas, cada uma com uma responsabilidade única e com tipos
explícitos em toda a fronteira entre elas:

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Rotas** | `src/routes` | Mapeiam método HTTP + caminho para um handler do controller (verbos RESTful). |
| **Controllers** | `src/controllers` | Traduzem HTTP ↔ domínio: leem `req`, montam o DTO e devolvem a resposta com o status HTTP correto. Não contêm regra de negócio. |
| **Services** | `src/services` | Concentram as **regras de negócio** e o acesso aos models. Lançam `AppError` com o status HTTP adequado. |
| **Models** | `src/models` | Definem o schema e as associações do Sequelize (classes tipadas). |
| **Middlewares** | `src/middlewares` | `asyncHandler` (propaga erros de handlers assíncronos), `authenticate` (valida o JWT e popula `req.user`), `errorHandler` (traduz `AppError` → resposta HTTP) e `notFoundHandler` (404). |
| **Infra** | `src/config`, `src/database`, `src/errors`, `src/utils`, `src/@types` | Configuração de ambiente, conexão, erro de aplicação, utilitários e DTOs. |

O fluxo de uma requisição é: `rota → controller → service → model`, e qualquer erro sobe até o
`errorHandler`, que responde com o código HTTP apropriado.

### Status HTTP utilizados

| Código | Uso |
|--------|-----|
| `200 OK` | Leitura e atualização bem-sucedidas |
| `201 Created` | Recurso criado (POST) |
| `204 No Content` | Recurso removido (DELETE) |
| `400 Bad Request` | Parâmetro inválido (ex.: `id` não numérico) |
| `401 Unauthorized` | Credenciais inválidas no login ou token ausente/inválido |
| `403 Forbidden` | Ação sobre recurso de outro usuário (ex.: editar perfil alheio) |
| `404 Not Found` | Recurso ou rota inexistente |
| `409 Conflict` | E-mail já cadastrado |
| `500 Internal Server Error` | Erro inesperado |

### Verificação de tipos

O projeto é **TypeScript com `strict: true`** e tipagem explícita nas camadas de DTO, models,
services e controllers — sem `any` e sem `require`/`module.exports`. Para conferir:

```bash
npx tsc --noEmit
```

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js 26 (LTS)
* **Linguagem:** TypeScript 7 (`strict: true`), compilado com `tsc` e executado em dev com `tsx`
* **Framework HTTP:** Express 5
* **ORM:** Sequelize 6
* **Migrações:** Umzug 3 (migrator oficial do time do Sequelize)
* **Banco de Dados:** PostgreSQL (`pg`) ou MySQL (`mysql2`); SQLite nos testes
* **Utilitários:** `cors`, `dotenv`, `http-status-codes`
* **Autenticação:** `jsonwebtoken` (JWT), `bcryptjs` (hash de senha), `google-auth-library` (login Google)
* **Testes:** Jest + Supertest com `@swc/jest` (SQLite em memória)

---

## 📁 Estrutura do projeto

```
.
├── src
│   ├── index.ts                # Bootstrap: conecta no banco, roda migrações e sobe o servidor
│   ├── app.ts                  # Cria e configura a instância do Express
│   ├── @types                  # DTOs e tipos (user, auth, book, category, bookCopy, address) + express.d.ts
│   ├── config
│   │   └── env.ts              # Leitura e validação das variáveis de ambiente
│   ├── database
│   │   ├── index.ts            # Instância do Sequelize (conexão)
│   │   ├── migrator.ts         # Migrator (Umzug) e runMigrations()
│   │   └── migrations          # Migrações versionadas do schema
│   ├── scripts
│   │   └── migrate.ts          # CLI de migrações (up / down / status / create)
│   ├── errors
│   │   └── AppError.ts         # Erro de aplicação com código HTTP
│   ├── middlewares
│   │   ├── asyncHandler.ts     # Encaminha rejeições para o errorHandler
│   │   ├── authenticate.ts     # Valida o JWT e popula req.user
│   │   ├── authorizeSelf.ts    # Garante que o usuário só age sobre o próprio recurso
│   │   ├── errorHandler.ts     # Traduz erros em respostas HTTP
│   │   └── notFoundHandler.ts  # 404 para rotas desconhecidas
│   ├── utils
│   │   ├── parseId.ts          # Valida/converte parâmetros de rota (id e outros)
│   │   ├── validation.ts       # Valida nome, e-mail, data e senha
│   │   ├── password.ts         # Hash e verificação de senha (bcrypt)
│   │   ├── jwt.ts              # Assinatura e verificação de token (JWT)
│   │   └── googleAuth.ts       # Valida o ID token do Google
│   ├── models                  # Models Sequelize tipados
│   │   ├── index.ts            # Barrel + seedBookStatuses()
│   │   ├── User.ts
│   │   ├── Book.ts
│   │   ├── Category.ts
│   │   ├── BookCopy.ts
│   │   └── Address.ts
│   ├── services                # Regras de negócio
│   │   ├── UserService.ts
│   │   ├── BookService.ts
│   │   ├── CategoryService.ts
│   │   ├── BookCopyService.ts
│   │   └── AddressService.ts
│   ├── controllers             # Camada HTTP (finos)
│   │   ├── UserController.ts
│   │   ├── BookController.ts
│   │   ├── CategoryController.ts
│   │   ├── BookCopyController.ts
│   │   └── AddressController.ts
│   └── routes                  # Definição das rotas (RESTful)
│       ├── index.ts            # Agrega todos os routers
│       ├── status.routes.ts
│       ├── user.routes.ts
│       ├── book.routes.ts
│       ├── category.routes.ts
│       ├── bookCopy.routes.ts
│       └── address.routes.ts
├── tests                       # Suíte Jest + Supertest (SQLite em memória)
│   ├── setup-env.ts
│   ├── helpers
│   │   ├── app.ts
│   │   └── auth.ts
│   ├── users.test.ts
│   └── resources.test.ts
├── documentation               # Requisitos e diagrama de caso de uso
├── dist                        # Saída da compilação (gerada por `npm run build`, ignorada pelo git)
├── .env.example                # Modelo das variáveis de ambiente
├── .nvmrc                      # Versão do Node recomendada (26.13.1)
├── jest.config.js              # Configuração do Jest (@swc/jest)
├── tsconfig.json               # Build de produção (apenas src)
├── tsconfig.test.json          # Type-check dos testes
└── package.json
```

---

## 🔌 Endpoints

Todos os recursos expõem o CRUD RESTful completo. `{id}` é sempre um inteiro positivo.
Rotas marcadas com 🔒 exigem autenticação (`Authorization: Bearer <token>`).

### Status

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/status` | Health check da API | — |

### Usuários

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| POST | `/users` | Cadastra um usuário | `{ Name, Birth?, Email, Pass }` |
| POST | `/users/login` | Autentica por e-mail/senha e devolve `token` | `{ Email, Pass }` |
| POST | `/users/google` | Autentica com Google (`idToken`) e devolve `token` | `{ idToken }` |
| GET 🔒 | `/users/me` | Perfil **completo** do usuário autenticado | — |
| PUT 🔒 | `/users/me` | Edita o próprio perfil (parcial) | `{ Name?, Birth?, Email?, Pass?, CurrentPass? }` |
| GET | `/users` | Lista perfis públicos (sem e-mail) | — |
| GET | `/users/:uuid` | Perfil público por UUID (sem e-mail) | — |
| GET | `/users/email/:email` | Perfil público por e-mail (sem e-mail) | — |
| PUT 🔒 | `/users/:uuid` | Atualiza **o próprio** perfil (parcial; 403 se for de outro) | `{ Name?, Birth?, Email?, Pass?, CurrentPass? }` |
| DELETE 🔒 | `/users/:uuid` | Remove **o próprio** usuário (403 se for outro) | — |

### Livros

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/books` | Catálogo público paginado; filtros `?title&categoryUuid&status&ownerUuid`, `?limit&offset`, `?sort&order` (só `available`) | — |
| GET | `/books/:uuid` | Detalhe público de um livro | — |
| GET 🔒 | `/users/me/books` | Estante **pessoal** do usuário autenticado (todos os status) | — |
| GET | `/users/:uuid/books` | Estante **pública** de outro usuário (só `available`; mesma paginação) | — |
| POST 🔒 | `/users/:uuid/follow` | Segue o usuário (400 se for você mesmo; 409 se já segue) | — |
| DELETE 🔒 | `/users/:uuid/follow` | Deixa de seguir (404 se não segue) | — |
| GET | `/users/:uuid/followers` | Seguidores do usuário (paginado) | — |
| GET | `/users/:uuid/following` | Quem o usuário segue (paginado) | — |
| POST 🔒 | `/users/:uuid/favorite` | Favorita a **estante** do usuário (400 próprio; 409 duplicado) | — |
| DELETE 🔒 | `/users/:uuid/favorite` | Desfavorita a estante (404 se não favoritou) | — |
| POST 🔒 | `/books/:uuid/favorite` | Favorita um **livro** (400 próprio; 409 duplicado) | — |
| DELETE 🔒 | `/books/:uuid/favorite` | Desfavorita o livro (404 se não favoritou) | — |
| GET 🔒 | `/users/me/favorites/shelves` | Estantes que o usuário favoritou (paginado) | — |
| GET 🔒 | `/users/me/favorites/books` | Livros que o usuário favoritou (paginado) | — |
| POST 🔒 | `/books` | Cadastra um livro (dono = usuário do token) | `{ Title, Autor, CategoryUuid, Status?, CreationDate?, CreationLocality? }` |
| PUT 🔒 | `/books/:uuid` | Atualiza um livro (**só o dono**; 403 se for de outro) | `{ Title?, Autor?, CategoryUuid?, Status?, CreationDate?, CreationLocality? }` |
| DELETE 🔒 | `/books/:uuid` | Remove um livro (**só o dono**; 403 se for de outro) | — |

### Categorias

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/categories` | Lista categorias | — |
| POST 🔒 | `/categories` | Cadastra uma categoria | `{ Description }` |
| GET | `/categories/:uuid` | Busca categoria por UUID | — |
| PUT 🔒 | `/categories/:uuid` | Atualiza uma categoria | `{ Description? }` |
| DELETE 🔒 | `/categories/:uuid` | Remove uma categoria | — |

### Exemplares de livros (BookCopy)

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/book-copies` | Lista exemplares | — |
| POST 🔒 | `/book-copies` | Cadastra um exemplar | `{ ISBN?, Editora, TypePrint, PublicationDate, PublicationLocality? }` |
| GET | `/book-copies/:uuid` | Busca exemplar por UUID | — |
| PUT 🔒 | `/book-copies/:uuid` | Atualiza um exemplar | `{ ISBN?, Editora?, TypePrint?, PublicationDate?, PublicationLocality? }` |
| DELETE 🔒 | `/book-copies/:uuid` | Remove um exemplar | — |

### Endereços

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/addresses` | Lista endereços | — |
| POST 🔒 | `/addresses` | Cadastra um endereço | `{ Rua, Numero, Complemento, Bairro, Cep, Cidade, Estado, Pais }` |
| GET | `/addresses/:uuid` | Busca endereço por UUID | — |
| PUT 🔒 | `/addresses/:uuid` | Atualiza um endereço | campos parciais do endereço |
| DELETE 🔒 | `/addresses/:uuid` | Remove um endereço | — |

### Autenticação (Regra 1)

1. **Cadastro local:** `POST /users` grava a senha como **hash bcrypt** e nunca a devolve.
2. **Login local:** `POST /users/login` valida a senha e responde
   `{ message, token, data: { Id, Name, Email } }`.
3. **Login com Google:** o cliente obtém um **ID token** (Google Identity Services) e envia em
   `POST /users/google` como `{ "idToken": "<token>" }`. O backend valida o token contra
   `GOOGLE_CLIENT_ID` e cria o usuário no primeiro acesso (`Provider = google`, sem senha local).
4. **Uso do token:** envie `Authorization: Bearer <token>` nas rotas protegidas (🔒). O token é um
   **JWT** assinado com `JWT_SECRET`, com validade definida em `JWT_EXPIRES_IN`.

```bash
# 1) login
curl -X POST http://localhost:3000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"Email":"ana@example.com","Pass":"secret"}'
# => { "message": "...", "token": "<jwt>", "data": { ... } }

# 2) requisição autenticada
curl http://localhost:3000/users/me -H "Authorization: Bearer <jwt>"
```

### Perfil (Regra 2)

O perfil tem duas visões: **a própria** (completa) e a **pública** (de terceiros).

* **`GET /users/me`** (🔒) devolve `{ Uuid, Name, Birth, Email, Provider, createdAt, updatedAt }`.
* **`GET /users`, `/users/:uuid`, `/users/email/:email`** devolvem apenas `{ Uuid, Name, Provider }`
  — **sem e-mail** de terceiros.
* **`PUT /users/me`** (🔒) edita o próprio perfil (parcial). Campos são validados: `Name` não vazio,
  `Email` com formato válido (normalizado em minúsculas), `Birth` como data válida (ou `null` para
  limpar).
* **Troca de senha:** enviar `Pass` exige `CurrentPass` (a senha atual). Contas `google` não têm
  senha local e não podem trocá-la por aqui (`403`).
* **Posse:** `PUT /users/:uuid` e `DELETE /users/:uuid` só funcionam para o **próprio** `:uuid`;
  qualquer outro retorna `403`.

```bash
# editar o próprio perfil
curl -X PUT http://localhost:3000/users/me \
  -H "Authorization: Bearer <jwt>" -H 'Content-Type: application/json' \
  -d '{"Name":"Ana Maria"}'

# trocar a senha (exige a senha atual)
curl -X PUT http://localhost:3000/users/me \
  -H "Authorization: Bearer <jwt>" -H 'Content-Type: application/json' \
  -d '{"Pass":"novaSenha","CurrentPass":"secret"}'
```

### Estante e catálogo de livros (Regra 3)

Cada livro pertence a um **dono** (`Book.UserId`, definido pelo token na criação) e tem um **status**
(`available`, `reserved` ou `traded`). A resposta pública de um livro **não expõe `UserId` nem o
`Id` interno**: o dono aparece apenas como `Owner: { Name }` e as rotas usam `Uuid`.

* **Estante pessoal (privada):** `GET /users/me/books` (🔒) lista os livros do usuário autenticado
  (todos os status).
* **Catálogo público:** `GET /books` e `GET /books/:uuid` (sem token). O catálogo mostra apenas
  livros **disponíveis** (`available`) e devolve um envelope paginado (ver Regra 4 abaixo).
* **CRUD restrito ao dono:** `POST /books` (dono = token), `PUT /books/:uuid` e `DELETE /books/:uuid`
  — qualquer outro usuário autenticado recebe `403`.
* **Corpo do livro:** `{ Title, Autor, CategoryUuid, Status?, CreationDate?, CreationLocality? }`.
  `Status` é o nome (`available` por padrão); um status inexistente retorna `400`.

```bash
# estante do próprio usuário
curl http://localhost:3000/users/me/books -H "Authorization: Bearer <jwt>"

# catálogo público com busca por título
curl "http://localhost:3000/books?title=casmurro"

# cadastrar um livro na própria estante
curl -X POST http://localhost:3000/books \
  -H "Authorization: Bearer <jwt>" -H 'Content-Type: application/json' \
  -d '{"Title":"Dom Casmurro","Autor":"Machado de Assis","CategoryUuid":"<uuid-da-categoria>"}'

# marcar como reservado para troca
curl -X PUT http://localhost:3000/books/<uuid-do-livro> \
  -H "Authorization: Bearer <jwt>" -H 'Content-Type: application/json' \
  -d '{"Status":"reserved"}'
```

### Catálogo: paginação, ordenação e filtros (Regra 4)

As listagens (`GET /books`, `GET /users/me/books` e `GET /users/:uuid/books`) devolvem um **envelope
paginado**:

```json
{
  "data": [ { "Uuid": "...", "Title": "Dom Casmurro", "Owner": { "Name": "Ana" }, "Status": { "Name": "available", "Description": "Disponível" } } ],
  "meta": { "limit": 20, "offset": 0, "total": 1, "count": 1, "hasMore": false }
}
```

Parâmetros de query (todos opcionais):

| Parâmetro | Valores | Default |
|-----------|---------|---------|
| `limit` | inteiro de `1` a `50` | `20` |
| `offset` | inteiro `>= 0` | `0` |
| `sort` | `createdAt`, `updatedAt`, `Title`, `Autor` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |
| `title` | trecho do título (parcial, case-insensitive) | — |
| `categoryUuid` | UUID da categoria | — |
| `status` | `available`, `reserved`, `traded` | `available` (no catálogo e na estante de terceiros) |
| `ownerUuid` | UUID do dono | — |

Valores fora das opções acima retornam **400**. O **catálogo** (`GET /books`) e a **estante de
terceiros** (`GET /users/:uuid/books`) listam por padrão apenas livros `available`; a **própria
estante** (`GET /users/me/books`) mostra todos os status.

```bash
# catálogo: 2ª página, ordenado por título
curl "http://localhost:3000/books?limit=10&offset=10&sort=Title&order=asc"

# filtrar por categoria e por dono
curl "http://localhost:3000/books?categoryUuid=<uuid>&ownerUuid=<uuid>"

# estante pública de outro usuário
curl "http://localhost:3000/users/<uuid>/books?limit=5"
```

### Seguir e favoritar (Regras 5 e 6)

**Seguir (Regra 5)** é uma relação entre **usuários** (donos). **Favoritar (Regra 6)** tem duas
entidades distintas: favoritar uma **estante** (o dono) e favoritar um **livro** individualmente.

```bash
# seguir / deixar de seguir
curl -X POST   http://localhost:3000/users/<uuid>/follow -H "Authorization: Bearer <jwt>"
curl -X DELETE http://localhost:3000/users/<uuid>/follow -H "Authorization: Bearer <jwt>"

# seguidores e quem segue (paginado, mesmo envelope da Regra 4)
curl "http://localhost:3000/users/<uuid>/followers?limit=10&offset=0&sort=Name&order=asc"
curl "http://localhost:3000/users/<uuid>/following"

# favoritar / desfavoritar uma estante
curl -X POST   http://localhost:3000/users/<uuid>/favorite -H "Authorization: Bearer <jwt>"
curl -X DELETE http://localhost:3000/users/<uuid>/favorite -H "Authorization: Bearer <jwt>"

# favoritar / desfavoritar um livro
curl -X POST   http://localhost:3000/books/<uuid>/favorite -H "Authorization: Bearer <jwt>"
curl -X DELETE http://localhost:3000/books/<uuid>/favorite -H "Authorization: Bearer <jwt>"

# minhas listas privadas de favoritos
curl http://localhost:3000/users/me/favorites/shelves -H "Authorization: Bearer <jwt>"
curl http://localhost:3000/users/me/favorites/books   -H "Authorization: Bearer <jwt>"
```

Regras de negócio:

- Seguir a si mesmo ou favoritar a **própria** estante/livro → **400**.
- Repetir uma ação já existente (seguir/favoritar duas vezes) → **409**.
- Desfazer algo que não existe (deixar de seguir / desfavoritar) → **404**.
- Todas as rotas de ação exigem autenticação (**401** sem token).
- As listagens de relacionamento e favoritos usam o **mesmo envelope paginado** da Regra 4
  (`?limit&offset`, `?sort&order`). As listagens de favoritos são **privadas** (só o próprio
  usuário); as listagens de seguir/seguidores são públicas.
- `GET /users/:uuid` inclui `followersCount` e `followingCount`.

### Formato de erro

Erros retornam o status HTTP adequado e um corpo padronizado:

```json
{ "status": 404, "message": "Usuário não encontrado." }
```

---

## 🗄️ Modelos de dados

Definidos em `src/models/` como classes Sequelize tipadas:

Todos os models têm `Id` (inteiro, chave primária, para indexação) e **`Uuid`** (GUID, único) — as
rotas usam sempre o `Uuid`; o `Id` fica apenas como constraint/chave interna.

* **User:** `Uuid`, `Name`, `Birth` (opcional), `Email` (único), `Pass` (hash bcrypt; nulo em contas Google), `Provider` (`local`/`google`)
* **Book:** `Uuid`, `Title`, `Autor`, `CreationDate`, `CreationLocality`, `CategoryId` (`belongsTo` Category), `UserId` (`belongsTo` User — dono), `StatusId` (`belongsTo` BookStatus)
* **BookStatus:** `Uuid`, `Name` (`available`/`reserved`/`traded`, único), `Description` — semeado na inicialização
* **Category:** `Uuid`, `Description`
* **BookCopy:** `Uuid`, `ISBN`, `Editora`, `TypePrint`, `PublicationDate`, `PublicationLocality`
* **Address:** `Uuid`, `Rua`, `Numero`, `Complemento`, `Bairro`, `Cep`, `Cidade`, `Estado`, `Pais`

Na inicialização (`src/index.ts`), a aplicação chama `sequelize.authenticate()` e roda as
**migrações** pendentes (`runMigrations()`), garantindo o schema antes de subir o servidor. Veja
[Banco de dados e migrações](#️-banco-de-dados-e-migrações) para o fluxo completo.

---

## 🚀 Pré-requisitos

* [Node.js](https://nodejs.org) **26 ou superior** (LTS atual). O projeto fixa a versão em `.nvmrc`
  (`nvm use` / `fnm use` para adotá-la) e declara `engines.node >= 26`.
* PostgreSQL 16+ **ou** MySQL 8 (ou um container `postgres:16` / `mysql:8`). Para os testes
  automatizados **não é necessário** um servidor de banco, pois a suíte usa SQLite em memória.
* [Git](https://git-scm.com)

---

## ⚙️ Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SteveSilvas/Books_Barter_Node.git
   cd Books_Barter_Node
   ```

2. **Use a versão correta do Node e instale as dependências:**
   ```bash
   nvm use        # ou: fnm use  (lê a versão de .nvmrc — Node 26)
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto, com base no `.env.example`:

   ```env
   # Banco de Dados (usado por src/config/env.ts e src/database/index.ts)
   DB_DIALECT=postgres     # postgres | mysql (padrão) | sqlite
   DB_NAME=nome_do_banco
   DB_USER=usuario
   DB_PASSWORD=senha
   DB_HOST=localhost
   DB_PORT=5432            # 5432 (postgres) | 3306 (mysql)
   DB_SSL=false            # true para Postgres remoto que exige TLS

   # Porta do servidor HTTP (padrão: 3000)
   PORT=3000

   # Autenticação (Regra 1)
   JWT_SECRET=troque-por-um-segredo-forte
   JWT_EXPIRES_IN=1d
   GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
   ```

   Com `DB_DIALECT=postgres` ou `DB_DIALECT=mysql`, as variáveis `DB_NAME`, `DB_USER` e `DB_HOST`
   são obrigatórias — se faltarem, a aplicação falha na inicialização com uma mensagem clara. A
   porta padrão é `5432` no Postgres e `3306` no MySQL. Em Postgres remoto que exige TLS, defina
   `DB_SSL=true`. Com `DB_DIALECT=sqlite`, nenhuma credencial é exigida e o banco é um arquivo local
   (`DB_STORAGE`, padrão `:memory:`), configuração usada pela suíte de testes.

   `JWT_SECRET` e `JWT_EXPIRES_IN` controlam a assinatura/validade do token (há padrões apenas para
   desenvolvimento). `GOOGLE_CLIENT_ID` é o audience aceito em `POST /users/google`.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A API ficará disponível em `http://localhost:3000` (ou na porta definida em `PORT`).
   O endpoint de verificação é `GET /status`.

5. **(Opcional) Build de produção:**
   ```bash
   npm run build
   npm start
   ```
   O `build` gera o JavaScript em `dist/` e o `start` executa `dist/index.js`.

---

## 📜 Scripts npm

| Script | Comando | Descrição |
|--------|---------|-----------|
| `npm run dev`   | `tsx watch src/index.ts` | Ambiente de desenvolvimento (reload automático) |
| `npm run build` | `tsc -p .` | Compila o TypeScript para `dist/` |
| `npm start`     | `node ./dist/index.js` | Executa o build de produção |
| `npm run migrate` | `tsx src/scripts/migrate.ts up` | Aplica todas as migrações pendentes |
| `npm run migrate:down` | `tsx src/scripts/migrate.ts down` | Reverte a última migração aplicada |
| `npm run migrate:status` | `tsx src/scripts/migrate.ts status` | Lista migrações aplicadas e pendentes |
| `npm run migrate:prod` | `node ./dist/scripts/migrate.js up` | Aplica migrações no build de produção |
| `npm test`      | `jest --runInBand` | Executa a suíte de testes automatizados |
| `npm run test:watch` | `jest --watch` | Executa os testes em modo watch |
| `npm run typecheck` | `tsc -p tsconfig.test.json` | Checa os tipos de `src` e `tests` |

---

## 🗄️ Banco de dados e migrações

O schema é versionado com **migrações** ([Umzug](https://github.com/sequelize/umzug), o migrator
oficial do time do Sequelize). O bootstrap da API (`src/index.ts`) executa as migrações pendentes
automaticamente ao subir, então em produção **não é preciso rodar nada à mão**.

### Fluxo do dia a dia

```bash
# Aplicar todas as migrações pendentes
npm run migrate

# Ver o que já foi aplicado e o que está pendente
npm run migrate:status

# Reverter a última migração aplicada
npm run migrate:down

# Criar um novo arquivo de migração (gera um scaffold no padrão do projeto)
npx tsx src/scripts/migrate.ts create add-telefone-usuario
```

O `create` gera um arquivo `src/database/migrations/<timestamp>.add-telefone-usuario.ts` com o
esqueleto `up`/`down` já tipado. Basta preencher as alterações:

```ts
import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator';

export const up: Migration = async ({ context }) => {
    await context.queryInterface.addColumn('Users', 'Telefone', {
        type: DataTypes.STRING,
        allowNull: true,
    });
};

export const down: Migration = async ({ context }) => {
    await context.queryInterface.removeColumn('Users', 'Telefone');
};
```

Assim, **alterar o schema depois** (adicionar/remover colunas, tabelas, índices) é só criar uma
nova migração — sem recriar as tabelas nem perder dados.

### Migração inicial e bancos já existentes

A migração `0001-create-initial-schema` cria as 9 tabelas do projeto. Ela é **idempotente**: se o
banco já tem o schema (por exemplo, um banco antigo criado com `sequelize.sync`), a migração apenas
registra que foi aplicada, **sem** recriar nada. Isso permite adotar migrações em bases existentes
com segurança.

### Comandos em produção

No build de produção, use `npm run migrate:prod` (ou deixe o próprio `npm start` aplicar as
migrações pendentes ao subir):

```bash
npm run build          # gera dist/ (inclui as migrações compiladas)
npm run migrate:prod   # aplica as migrações pendentes
npm start              # sobe a API (também aplica pendentes automaticamente)
```

As migrações aplicadas ficam registradas na tabela `SequelizeMeta`, que guarda o histórico do que
já rodou em cada banco.

---

## 🧪 Testes

A suíte usa **Jest + Supertest** (transformando TypeScript com `@swc/jest`) e cobre as rotas via
requisições HTTP reais contra a aplicação Express. Os testes rodam com **SQLite em memória**
(dialeto configurado por `DB_DIALECT=sqlite`), então **não é necessário ter um PostgreSQL ou MySQL
rodando** para executá-los.

```bash
npm test
```

Cobertura atual (90 casos): criação/listagem/busca/atualização/remoção de usuários, login válido e
inválido, senha com hash (não em texto puro), **token JWT** e rotas protegidas (401 sem token/token
inválido), **perfil próprio vs. público** (e-mail oculto de terceiros), edição de perfil com
validação (nome/e-mail/data), **troca de senha** (senha atual obrigatória), **posse do recurso**
(403 ao editar/remover outro usuário ou livro alheio), login Google (400 sem `idToken`, 401 com
`idToken` inválido), **estante pessoal privada** (`/users/me/books`, 401 sem token), **catálogo
público com busca por título** e sem vazamento de `UserId`, **status do livro** (default `available`,
troca para `reserved`/`traded`, 400 para inexistente), `Uuid` inválido (400) e inexistente (404),
e-mail duplicado, recurso e rota inexistentes, **catálogo paginado** (`limit`/`offset` + metadados),
**ordenação** (allowlist, 400 fora dela), **filtros** (categoria/status/dono), **estante pública de
terceiros** (por UUID, 400/404), **seguir/deixar de seguir** (listas paginadas, contadores, 400/401/404/409),
**favoritar estantes e livros** (listas privadas, ordenação, isolamento por usuário, 400/401/404/409),
e o ciclo CRUD completo de `books`,
`categories`, `book-copies` e `addresses` — verificando os status HTTP esperados
(`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`).

Estrutura:

```
tests/
├── setup-env.ts        # Define DB_DIALECT=sqlite antes de carregar a aplicação
├── helpers
│   ├── app.ts          # Cria o app Express com banco recriado pelas migrações
│   └── auth.ts         # Cadastra/loga e devolve o token para requisições autenticadas
├── users.test.ts       # Usuários, autenticação, login, posse e erros
└── resources.test.ts   # Books (catálogo, estante, posse, status), Categories, BookCopies, Addresses
```

Para checar os tipos dos testes:

```bash
npm run typecheck
```

---

## 🐳 Docker

O projeto inclui um `Dockerfile` multi-stage (build com TypeScript → runtime enxuto com apenas as
dependências de produção).

```bash
# build da imagem
docker build -t books-barter-api .

# execução (aponte as variáveis para um banco acessível)
docker run --rm -p 3000:3000 --env-file .env books-barter-api
```

> ⚠️ Em **produção** use PostgreSQL (`DB_DIALECT=postgres`) ou MySQL (`DB_DIALECT=mysql`). O driver
> `sqlite3` é uma dependência de **desenvolvimento** (usada nos testes) e **não** é instalado na
> imagem de runtime. Para rodar a API com Postgres via Docker Compose, suba um serviço `postgres:16`
> e aponte `DB_HOST` para ele.

Verifique a saúde após subir o container:

```bash
curl http://localhost:3000/status
# => {"status":"ok","message":"API em funcionamento."}
```

---

## 🛡️ Segurança

A plataforma incentiva boas práticas para a segurança da comunidade:

* Prefira **locais públicos e movimentados** (shoppings, centros culturais, praças e estações) para a troca.
* Nunca compartilhe dados bancários ou endereços residenciais privados pelo chat.

### Limitações conhecidas

* O **catálogo** de livros é público por design; a **estante pessoal** (`/users/me/books`) é privada,
  mas ainda não há níveis de privacidade configuráveis pelo usuário.
* Não há **papel de administrador**: a posse (dono do perfil/livro) é a única regra de autorização.
* O catálogo não tem **busca textual além do título** (ex.: autor, descrição) nem ordenação por
  relevância; a ordenação é restrita aos campos da allowlist.
* Não há **refresh token** nem revogação de JWT: o token expira conforme `JWT_EXPIRES_IN`.
* O login com Google valida o ID token no backend; não há fluxo OAuth interativo (redirect) — o
  cliente obtém o ID token (Google Identity Services) e o envia à API.

---

## 🤝 Como Contribuir

1. Certifique-se de estar na branch `master` atualizada:
   ```bash
   git checkout master
   git pull
   ```
2. Faça suas alterações e commite **diretamente na branch `master`**:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   git push origin master
   ```

---

## 📄 Licença

Este projeto está sob a licença **ISC** (conforme declarado em `package.json`).
