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
| Ver e editar perfil (`GET/PUT /users/me`, perfis públicos sem e-mail, posse em `/users/:id`) | ✅ | `UserController`, `authorizeSelf` |
| CRUD de livros (`/books`) com categoria associada (`Book belongsTo Category`) | 🟡 | `src/services/BookService.ts` |
| CRUD de categorias (`/categories`) | ✅ | `CategoryService` |
| CRUD de exemplares (`/book-copies`) | ✅ | `BookCopyService` |
| CRUD de endereços (`/addresses`) | ✅ | `AddressService` |
| Middlewares de erro/404 e `AppError` com status HTTP | ✅ | `src/middlewares`, `src/errors` |
| Suíte de testes de integração (Jest + Supertest, SQLite em memória, 48 casos) | ✅ | `tests/` |
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

### Fase 1 — Estante digital pública (regra 3) 🟡

- [ ] Vincular `Book → User`: adicionar `UserId` em `Book` + associação `User.hasMany(Book)`
      (alteração via model, Code First).
- [ ] Criar `POST /books` associando o livro ao usuário autenticado (dono).
- [ ] Criar `GET /users/:id/books` (estante de um usuário).
- [ ] Garantir que apenas o dono edite/remova seu livro (`PUT`/`DELETE /books/:id`).

**Aceite:** um usuário cadastra livros e eles formam sua estante; outro usuário consegue consultá-la.

---

### Fase 2 — Visibilidade da estante de outros (regra 4) 🔴

- [ ] `GET /users/:id/books` público (estante visível sem autenticação, se a regra exigir).
- [ ] Paginação e ordenação na listagem de estantes/livros.
- [ ] Visibilidade por status do livro (ex.: disponível para escambo / já negociado).

**Aceite:** as estantes publicadas são visíveis para outros usuários.

---

### Fase 3 — Recursos sociais (regras 5 e 6) 🔴

- [ ] **Seguir / deixar de seguir** — model `Follow` (`FollowerId`, `FollowingId`) + associações.
  - `POST /users/:id/follow`, `DELETE /users/:id/follow`
  - `GET /users/:id/followers`, `GET /users/:id/following`
- [ ] **Favoritar / desfavoritar livros e estantes** — model `Favorite` (`UserId`, `BookId`/`UserId` alvo).
  - `POST /favorites`, `DELETE /favorites/:id`, `GET /users/:id/favorites`
- [ ] Regras de negócio: não seguir a si mesmo; não favoritar duas vezes (409).

**Aceite:** o usuário segue/deixa de seguir e favorita/desfavorita, com listagens consultáveis.

---

### Fase 4 — Chat de negociação (regra 7) 🔴

- [ ] Model `Conversation` (participantes + livro de interesse) e `Message` (`ConversationId`, `SenderId`, texto, timestamp).
- [ ] `POST /conversations` (abrir negociação a partir de um livro).
- [ ] `GET /conversations`, `GET /conversations/:id/messages`, `POST /conversations/:id/messages`.
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
