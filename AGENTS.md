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
  config/env.ts   leitura/validação de env (DB_NAME, DB_USER, DB_HOST obrigatórios; PORT padrão 3000)
  database/       instância do Sequelize
  errors/         AppError (message + statusCode)
  middlewares/    asyncHandler, errorHandler, notFoundHandler
  utils/          parseId
  @types/         DTOs por recurso (user, auth, book, category, bookCopy, address)
  models/         classes Sequelize tipadas (InferAttributes/InferCreationAttributes)
  services/       regras de negócio; lançam AppError; exportam singleton (ex.: userService)
  controllers/    finos: leem req, montam DTO, respondem com status correto
  routes/         um arquivo *.routes.ts por recurso + index.ts agregador
tests/            Jest + Supertest (setup-env.ts, helpers/app.ts, *.test.ts)
```

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
- Status HTTP: 200 leitura/update, 201 create, 204 delete, 400 id inválido,
  401 credenciais, 404 recurso/rota, 409 e-mail duplicado, 500 inesperado.
- Respostas de erro: `{ "status": <code>, "message": <texto> }`.
- Rotas RESTful: plural (`/users`, `/books`, `/categories`, `/book-copies`, `/addresses`);
  update/delete por `/:id` com verbo HTTP, não por sufixo (`/update`, `/delete`).

## Banco

Nomes de tabela preservados: `Users`, `Categories`, `Books`, `BookCopies`, `Addresses`.
`sequelize.sync()` na inicialização cria/atualiza todas as tabelas.

## Git

Branch padrão: `master` (não há `main`). Commits direto em `master`, conforme preferência do usuário.
`dist/`, `node_modules/` e `.env` são ignorados; `.env.example` é versionado.
