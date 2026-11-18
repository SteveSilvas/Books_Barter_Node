# AGENTS.md

## Projeto

`bibliotech` (EscamboLiterário) — API REST de escambo de livros.
Node.js + TypeScript + Express 4 + Sequelize 6 + MySQL (`mysql2`).

## Comandos

```bash
npm run dev      # ts-node-dev
npm run build    # tsc -p .
npm start        # node ./dist/index.js
npx tsc --noEmit # checagem de tipos sem emitir
```

Testes de runtime exigem MySQL acessível (use um container `mysql:8`).

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
```

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
