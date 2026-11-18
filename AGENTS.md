# AGENTS.md

## Projeto

`escambo-literario-api` (EscamboLiterário) — API REST de escambo de livros.
Node.js 26 + TypeScript 7 + Express 5 + Sequelize 6 + MySQL (`mysql2`); testes com Jest + Supertest + SQLite.

## Comandos

```bash
npm run dev      # tsx watch src/index.ts (reload automático)
npm run build    # tsc -p .  (apenas src)
npm start        # node ./dist/index.js
npm test         # jest --runInBand (SQLite em memória, sem MySQL)
npm run typecheck # tsc -p tsconfig.test.json (checa src + tests)
npx tsc --noEmit # checagem de tipos apenas do código-fonte
```

Versão do Node fixada em `.nvmrc` (26.13.1) e em `engines.node >= 26`.

Testes automatizados usam **Jest + Supertest** com transform `@swc/jest` e SQLite
(`DB_DIALECT=sqlite`, configurado em `tests/setup-env.ts`), então não exigem MySQL. Testes manuais
de runtime exigem MySQL (use um container `mysql:8`).

> TypeScript 7 é o port nativo (`tsc`); ferramentas que usam a API interna do compilador
> (ts-jest/ts-node) não funcionam com ele. Por isso o dev usa `tsx` e o Jest usa `@swc/jest`.

## Arquitetura (arquivos por camada)

Fluxo: `rota → controller → service → model`; erros sobem até o `errorHandler`.

```
src/
  index.ts        bootstrap (authenticate + sync + listen)
  app.ts          cria/configura o Express
  config/env.ts   leitura/validação de env (DB_NAME, DB_USER, DB_HOST obrigatórios no mysql; PORT padrão 3000; sqlite dispensa credenciais)
  database/       instância do Sequelize (mysql ou sqlite)
  errors/         AppError (message + statusCode)
  middlewares/    asyncHandler, errorHandler, notFoundHandler, authenticate (JWT), authorizeSelf (posse de perfil)
  utils/          parseId/parseParam/parseUuid, validation (nome/e-mail/data/senha), password (bcrypt), jwt (sign/verify), googleAuth (ID token)
  @types/         DTOs por recurso (user, auth, book, category, bookCopy, address) + express.d.ts (req.user)
  models/         classes Sequelize tipadas (InferAttributes/InferCreationAttributes)
  services/       regras de negócio; lançam AppError; exportam singleton (ex.: userService)
  controllers/    finos: leem req, montam DTO, respondem com status correto
  routes/         um arquivo *.routes.ts por recurso + index.ts agregador
tests/            Jest + Supertest (setup-env.ts, helpers/app.ts, helpers/auth.ts, *.test.ts)
```

## Autenticação (Regra 1)

- Senhas com **bcrypt** (`src/utils/password.ts`); `Pass` nunca é retornado (`toPublic` em `UserService`).
- Sessão por **JWT** (`src/utils/jwt.ts`), assinado com `JWT_SECRET`, validade em `JWT_EXPIRES_IN`.
- `authenticate` (`src/middlewares/authenticate.ts`) exige `Authorization: Bearer <token>` e popula `req.user`.
- Login Google: `POST /users/google` com `{ idToken }`, validado em `src/utils/googleAuth.ts` contra `GOOGLE_CLIENT_ID`.
- Rotas de escrita (`POST/PUT/DELETE` de todos os recursos) são protegidas; leituras seguem públicas.
- Modelo `User`: `Pass` e `Birth` anuláveis; `Provider` (`local`/`google`) registra a origem da conta.

## Perfil (Regra 2)

- Duas visões: `toSelf` (próprio, completo) e `toPublic` (`{ Uuid, Name, Provider }`, sem e-mail).
- `GET/PUT /users/me` operam sobre o id do token; `PUT/DELETE /users/:uuid` passam por `authorizeSelf` (403).
- `update` valida via `utils/validation` (nome não vazio, e-mail normalizado, data válida) e troca de
  senha exige `CurrentPass`; contas `google` não trocam senha local (403).

## Estante e catálogo (Regra 3)

- Todo model tem `Id` (PK inteira, indexação) e **`Uuid`** (GUID, único); **as rotas usam `:uuid`**.
- `Book` tem `UserId` (não nulo, dono) e `StatusId` → `BookStatus` (`available`/`reserved`/`traded`,
  semeado em `seedBookStatuses()` chamado por `syncDatabase()`).
- `BookService.toPublic` **não expõe `UserId` nem `Id`**: devolve `Owner: { Name }`, `Category.Uuid` e `Status`.
- Estante pessoal **privada**: `GET /users/me/books` (dono = `req.user.Id`).
- Catálogo **público**: `GET /books?title=` (LIKE parcial) e `GET /books/:uuid`.
- CRUD do livro restrito ao dono: `BookService` checa `book.UserId !== userId` → 403.
- `POST/PUT /books` usam `CategoryUuid` e `Status` (nome); status inexistente → 400.

## Testes

- Integração real via Supertest contra `createApp()`; banco SQLite em memória (`sequelize.sync({ force: true })` por teste).
- `tests/setup-env.ts` define `DB_DIALECT=sqlite` e `DB_STORAGE` antes de carregar a app.
- Configuração em `jest.config.js`; type-check em `tsconfig.test.json`.
- Ao adicionar recurso novo, incluir testes de status HTTP (201/204/400/404/409) em `tests/`.

## Convenções

- Tipagem explícita e `strict: true`. Não usar `any`, `require` nem `module.exports`.
- Models exportam classes `Model<InferAttributes<T>, InferCreationAttributes<T>>`.
- Regras de negócio só em services; controllers não têm regra.
- Erros de domínio: `throw new AppError(msg, StatusCodes.X)`.
- Handlers de rota sempre envolvidos por `asyncHandler`.
- Status HTTP: 200 leitura/update, 201 create, 204 delete, 400 uuid inválido/status inválido,
  401 credenciais, 403 recurso de outro usuário, 404 recurso/rota, 409 e-mail duplicado, 500 inesperado.
- Respostas de erro: `{ "status": <code>, "message": <texto> }`.
- Rotas RESTful: plural (`/users`, `/books`, `/categories`, `/book-copies`, `/addresses`);
  update/delete por `/:uuid` com verbo HTTP, não por sufixo (`/update`, `/delete`).

## Banco

**Abordagem Code First:** a fonte da verdade do schema são os models Sequelize tipados em
`src/models/`; o banco é derivado do código (nunca o contrário). Evoluções de schema começam sempre
por uma alteração no model + associação.

Nomes de tabela: `Users`, `Categories`, `Books`, `BookStatuses`, `BookCopies`, `Addresses`.
`sequelize.sync()` na inicialização cria/atualiza todas as tabelas (dev/teste). Para produção,
migrações versionadas **geradas a partir dos models** — ver `ROADMAP.md`.

## Roadmap

Plano de evolução (feito × pendente) e estratégia Code First em `ROADMAP.md`. Consultar antes de
iniciar novas funcionalidades.

## Git

Branch padrão: `master` (não há `main`). Commits direto em `master`, conforme preferência do usuário.
`dist/`, `node_modules/` e `.env` são ignorados; `.env.example` é versionado.
