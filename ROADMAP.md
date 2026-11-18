# 🗺️ Roadmap — EscamboLiterário API

Plano de evolução da API REST de escambo de livros. Este documento registra **o que já foi feito**
(linha de base) e **o que falta** para atender integralmente às regras de negócio descritas em
`documentation/requirements.txt`.

Legenda de status:

* ✅ **Concluído** — implementado, testado e integrado.
* 🟡 **Parcial** — existe uma base funcional, mas faltam partes da regra.
* 🔴 **Pendente** — ainda não iniciado.
* 🧱 **Transversal** — não é regra de negócio, mas sustenta a entrega.

---

## 🧭 Estratégia: Code First

**Decisão de arquitetura: o projeto adota a abordagem Code First.**

* A **fonte da verdade do schema é o código**: os models Sequelize tipados em `src/models/`
  (`InferAttributes` / `InferCreationAttributes`) definem tabelas, colunas, tipos e associações.
* O banco é **derivado dos models**, não o contrário. Não há modelagem SQL-first nem escrita
  manual de DDL como origem.
* Hoje a criação/atualização do schema usa `sequelize.sync()` na inicialização (`src/index.ts`).
  Para evoluir com segurança, as migrações serão **geradas a partir dos models** (ver Fase 0),
  mantendo o model como ponto único de definição.
* Toda nova entidade (ex.: `Follow`, `Favorite`, `Conversation`, `Message`) nasce como model
  tipado + DTO + service + controller + rota + testes, seguindo a arquitetura em camadas já
  estabelecida.

Consequências práticas:

* Alterar o domínio = alterar o model; o schema acompanha.
* `sync()` é aceitável em dev/teste (SQLite em memória). Em produção, migrações versionadas.
* Testes de integração criam o schema a partir dos models (`sequelize.sync({ force: true })`),
  o que mantém o banco de teste sempre alinhado ao código.

---

## ✅ Linha de base (o que já foi feito)

Fundação técnica e recursos de apoio já entregues:

| Item | Status | Referência |
|------|--------|-----------|
| Arquitetura em camadas (`rota → controller → service → model`) com tipagem explícita | ✅ | `src/` |
| Stack modernizada: Node 26, TypeScript 7, Express 5, Sequelize 6, MySQL (`mysql2`) | ✅ | `package.json`, `.nvmrc` |
| Cadastro de usuário (`POST /users`) com bloqueio de e-mail duplicado (409) | ✅ | `src/services/UserService.ts` |
| Login por e-mail/senha (`POST /users/login`) com **hash bcrypt** e **JWT** | ✅ | `src/services/UserService.ts` |
| Login com Google (`POST /users/google`) via verificação de ID token | ✅ | `src/utils/googleAuth.ts` |
| Middleware de autenticação (`authenticate`) protegendo rotas de escrita | ✅ | `src/middlewares/authenticate.ts` |
| Senha nunca retornada nas respostas (DTO público sem `Pass`) | ✅ | `src/@types/user.ts`, `UserService` |
| Ver e editar perfil (`GET/PUT /users/me`, perfis públicos sem e-mail, posse em `/users/:uuid`) | ✅ | `UserController`, `authorizeSelf` |
| UUID (GUID) em todos os models; rotas usam `:uuid` e o `Id` fica como chave/index | ✅ | `src/models`, `src/utils/parseId.ts` |
| Livro com dono (`Book.UserId`) e status (`BookStatus`: available/reserved/traded) | ✅ | `src/models/Book.ts`, `src/models/BookStatus.ts` |
| Estante pessoal privada (`GET /users/me/books`) e catálogo público com busca por título | ✅ | `src/services/BookService.ts` |
| CRUD de livros restrito ao dono (403 caso contrário) | ✅ | `src/services/BookService.ts` |
| CRUD de livros (`/books`) com categoria associada (`Book belongsTo Category`) | ✅ | `src/services/BookService.ts` |
| CRUD de categorias (`/categories`) | ✅ | `CategoryService` |
| CRUD de exemplares (`/book-copies`) | ✅ | `BookCopyService` |
| CRUD de endereços (`/addresses`) | ✅ | `AddressService` |
| Middlewares de erro/404 e `AppError` com status HTTP | ✅ | `src/middlewares`, `src/errors` |
| Suíte de testes de integração (Jest + Supertest, SQLite em memória, 63 casos) | ✅ | `tests/` |
| Dialeto duplo MySQL/SQLite por configuração (`DB_DIALECT`) | ✅ | `src/config/env.ts`, `src/database/index.ts` |
| Documentação (README + AGENTS.md) alinhada ao código | ✅ | `README.md`, `AGENTS.md` |

---

## 🎯 Pendências por regra de negócio

Cada regra recebe uma fase, com tarefas acionáveis e critérios de aceite.

### Fase 0 — Fundação de autenticação 🧱 (regra 1) ✅

> Sem sessão/identidade confiável, não há como saber "quem é o dono", "quem segue" ou "quem negocia".

- [x] **Hash de senha** (bcrypt) no cadastro, no login e no update de senha.
- [x] **Emissão de token** (JWT) em `POST /users/login` e middleware `authenticate`.
- [x] **Login com Google** via verificação de ID token (`POST /users/google`).
- [x] Middleware de autorização: rotas de escrita exigem usuário autenticado.
- [x] Respostas `401` para token ausente/inválido; senha nunca retornada.
- [ ] Migrações versionadas **geradas a partir dos models** (Code First), substituindo `sync()` em produção. *(transversal — ver Dívidas técnicas)*

**Aceite atendido:** cadastro/loga com senha em hash, recebe um token e acessa rotas protegidas;
login via Google validado no backend.

**Pendência desta fase:** migrações versionadas (item transversal, não bloqueia as demais fases).

---

### Fase 1 — Estante digital (regra 3) ✅

- [x] Vincular `Book → User`: `UserId` (não nulo) em `Book` + associações `User.hasMany(Book)` /
      `Book.belongsTo(User)` (Code First).
- [x] `POST /books` associa o livro ao usuário autenticado (dono vindo do token).
- [x] Estante pessoal **privada**: `GET /users/me/books` (só o dono, via token).
- [x] Catálogo **público** com busca por título: `GET /books?title=` e `GET /books/:uuid`.
- [x] Apenas o dono edita/remove seu livro (`PUT`/`DELETE /books/:uuid`, 403 caso contrário).
- [x] Tabela de **status do livro** (`BookStatus`) com `available`/`reserved`/`traded`.
- [x] `Uuid` (GUID) em todos os models; rotas usam `:uuid` (o `Id` fica só como chave/index).

**Aceite:** um usuário cadastra livros formando sua estante (privada) e o catálogo público permite
ver e pesquisar livros por título, sem expor o `UserId` do dono.

---

### Fase 2 — Visibilidade da estante de outros (regra 4) ✅

- [x] Catálogo público (`GET /books`) com `Owner.Name` e busca por título.
- [x] Status do livro (`available`/`reserved`/`traded`) exposto na resposta.
- [x] Paginação (`?limit`/`?offset`, máx. 50) com envelope `{ data, meta }`.
- [x] Ordenação por allowlist (`?sort=createdAt|updatedAt|Title|Autor&order=asc|desc`).
- [x] Filtros por `title`, `categoryUuid`, `status` e `ownerUuid`.
- [x] Catálogo e estante de terceiros listam apenas livros `available`.
- [x] Estante pública de terceiros: `GET /users/:uuid/books`.

**Aceite:** os livros publicados são visíveis e pesquisáveis por outros usuários.

---

### Fase 3 — Recursos sociais (regras 5 e 6) 🔴

- [ ] **Seguir / deixar de seguir** — model `Follow` (`FollowerId`, `FollowingId`) + associações.
  - `POST /users/:uuid/follow`, `DELETE /users/:uuid/follow`
  - `GET /users/:uuid/followers`, `GET /users/:uuid/following`
- [ ] **Favoritar / desfavoritar livros e estantes** — model `Favorite` (`UserId`, `BookId`/`UserId` alvo).
  - `POST /favorites`, `DELETE /favorites/:uuid`, `GET /users/:uuid/favorites`
- [ ] Regras de negócio: não seguir a si mesmo; não favoritar duas vezes (409).

**Aceite:** o usuário segue/deixa de seguir e favorita/desfavorita, com listagens consultáveis.

---

### Fase 4 — Chat de negociação (regra 7) 🔴

- [ ] Model `Conversation` (participantes + livro de interesse) e `Message` (`ConversationId`, `SenderId`, texto, timestamp).
- [ ] `POST /conversations` (abrir negociação a partir de um livro).
- [ ] `GET /conversations`, `GET /conversations/:uuid/messages`, `POST /conversations/:uuid/messages`.
- [ ] Entrega em tempo real (WebSocket/SSE) — opcional, pode iniciar com polling.
- [ ] Regras: só participantes leem/escrevem; notificar o proprietário do livro.

**Aceite:** dois usuários abrem um chat sobre um livro e trocam mensagens.

---

## 🧱 Dívidas técnicas e melhorias transversais

- [ ] Migrações versionadas (Code First) e script `npm run db:migrate`.
- [ ] Validação de entrada (ex.: `zod`/`class-validator`) antes de chegar ao service.
- [ ] Hashing de senha e remoção de dados sensíveis das respostas (`Pass` nunca retornar).
- [ ] Paginação/filtros padronizados na listagem.
- [ ] Cobertura de testes para as novas regras; meta de cobertura mínima no CI.
- [ ] Pipeline de CI (build + typecheck + testes) no GitHub Actions.
- [ ] Documentação de API (OpenAPI/Swagger) gerada a partir das rotas.
- [ ] `BookCopy → Book` e demais associações pendentes, se necessárias à logística de escambo.

---

## 📐 Definition of Done (por entrega)

Uma tarefa só é considerada concluída quando:

1. O model (Code First) e a associação estão definidos em `src/models/`.
2. DTO em `src/@types/`, regra no service, controller fino e rota RESTful.
3. Status HTTP corretos (`200/201/204/400/401/404/409`).
4. Testes de integração (Jest + Supertest) cobrindo caminho feliz e erros.
5. `npm run build`, `npm run typecheck` e `npm test` verdes.
6. README/AGENTS.md atualizados quando houver mudança de comportamento ou de stack.

---

## 🔭 Visão de sequência

```
Fase 0 (auth/sessão) ✅  →  Fase 1 (estante)  →  Fase 2 (visibilidade)
                                                  ↘
                                                   Fase 3 (social)  →  Fase 4 (chat)
```

A Fase 0 (identidade/sessão) está concluída e destrava as demais. Fases 3 e 4 dependem também da
noção de "dono" da Fase 1.
