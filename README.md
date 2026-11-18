# 📚 EscamboLiterário — API de Escambo de Livros

API REST em **Node.js + TypeScript** que dá suporte a uma plataforma de troca (escambo) de livros
entre leitores. Este documento descreve **as regras de negócio do produto** (o que o sistema deve
fazer) e mostra, em seguida, **como a API atual se posiciona em relação a elas** — o que já está
implementado, o que está parcial e o que ainda falta.

> O pacote está registrado como `escambo-literario-api` no `package.json`.

---

## 🎯 Objetivo do produto

Alguns leitores gostam de colecionar seus livros prediletos, mas com o tempo acumulam mais do que
conseguem guardar. A troca entre amigos é a solução mais comum, porém nem sempre garante que o leitor
encontre o exato livro que deseja. A proposta deste sistema é permitir que os leitores compartilhem
os livros dos quais pretendem se desapegar e encontrem seus livros de interesse por meio de
**escambo negociado diretamente com o proprietário**.

---

## 📋 Regras de negócio (a cumprir)

Estas são as regras gerais que a solução deve atender (baseadas em `documentation/requirements.txt`).
Elas são a referência do projeto — o código é apenas uma parte do que ainda precisa ser construído.

1. **Acesso autenticado:** para acessar o sistema é necessário estar logado (com o Google) ou cadastrado.
2. **Perfil do usuário:** o usuário pode ver e editar o próprio perfil.
3. **Estante digital:** o usuário pode cadastrar seus livros, criando uma estante digital pública.
4. **Visibilidade pública:** uma vez publicados, outros usuários podem visualizar essa estante digital.
5. **Rede social:** os usuários podem seguir e deixar de seguir uns aos outros.
6. **Favoritos:** os usuários podem favoritar e desfavoritar estantes e livros para ver futuramente.
7. **Negociação por chat:** os usuários podem abrir um chat de negociação para escambar um livro de interesse.

**Atores:** usuários que cadastram seus livros e interagem com a comunidade para encontrar livros de
interesse e se desfazer de exemplares que não precisam.

---

## ✅ Cobertura atual: regras × API

A tabela abaixo cruza cada regra de negócio com o que existe hoje no código. Use-a como mapa do que
já foi entregue e do que ainda precisa ser desenvolvido.

| # | Regra de negócio | Status | O que existe no código hoje |
|---|------------------|--------|------------------------------|
| 1 | Acesso autenticado | 🟡 Parcial | Cadastro (`POST /users`) e login por e-mail/senha (`POST /users/login`). **Falta** login via Google e sessão/token (hoje o login apenas retorna os dados do usuário). |
| 2 | Ver e editar perfil | ✅ Implementado | Consulta por id/e-mail e `PUT /users/:id` (edição de perfil). O update persiste apenas os campos enviados (parcial) e impede e-mail duplicado. |
| 3 | Estante digital pública | 🟡 Parcial | Cadastro e listagem de livros (`/books`). **Falta** o vínculo `Book → User` (não há noção de "dono" da estante). |
| 4 | Visibilidade da estante de outros | 🔴 Pendente | Existe listagem geral de livros, mas **sem filtro por usuário/estante**. |
| 5 | Seguir / deixar de seguir | 🔴 Pendente | Não implementado (sem entidade de relacionamento entre usuários). |
| 6 | Favoritar / desfavoritar | 🔴 Pendente | Não implementado (sem entidade de favoritos). |
| 7 | Chat de negociação | 🔴 Pendente | Não implementado (sem entidades de conversa/mensagem). |

**Legenda:** ✅ implementado · 🟡 parcial · 🔴 pendente.

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
| **Middlewares** | `src/middlewares` | `asyncHandler` (propaga erros de handlers assíncronos), `errorHandler` (traduz `AppError` → resposta HTTP) e `notFoundHandler` (404). |
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
| `401 Unauthorized` | Credenciais inválidas no login |
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
* **Banco de Dados:** MySQL (`mysql2`)
* **Utilitários:** `cors`, `dotenv`, `http-status-codes`
* **Testes:** Jest + Supertest com `@swc/jest` (SQLite em memória)

---

## 📁 Estrutura do projeto

```
.
├── src
│   ├── index.ts                # Bootstrap: conecta no banco, sincroniza e sobe o servidor
│   ├── app.ts                  # Cria e configura a instância do Express
│   ├── @types                  # DTOs e tipos (user, auth, book, category, bookCopy, address)
│   ├── config
│   │   └── env.ts              # Leitura e validação das variáveis de ambiente
│   ├── database
│   │   └── index.ts            # Instância do Sequelize (conexão)
│   ├── errors
│   │   └── AppError.ts         # Erro de aplicação com código HTTP
│   ├── middlewares
│   │   ├── asyncHandler.ts     # Encaminha rejeições para o errorHandler
│   │   ├── errorHandler.ts     # Traduz erros em respostas HTTP
│   │   └── notFoundHandler.ts  # 404 para rotas desconhecidas
│   ├── utils
│   │   └── parseId.ts          # Valida/converte parâmetros de rota (id e outros)
│   ├── models                  # Models Sequelize tipados
│   │   ├── index.ts            # Barrel + syncDatabase()
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
│   ├── helpers/app.ts
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

### Status

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/status` | Health check da API | — |

### Usuários

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/users` | Lista todos os usuários | — |
| POST | `/users` | Cadastra um usuário | `{ Name, Birth, Email, Pass }` |
| POST | `/users/login` | Autentica um usuário | `{ Email, Pass }` |
| GET | `/users/:id` | Busca usuário por id | — |
| GET | `/users/email/:email` | Busca usuário por e-mail | — |
| PUT | `/users/:id` | Atualiza um usuário (aceita atualização parcial) | `{ Name?, Birth?, Email?, Pass? }` |
| DELETE | `/users/:id` | Remove um usuário | — |

### Livros

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/books` | Lista livros (ordem decrescente por id, com a categoria) | — |
| POST | `/books` | Cadastra um livro | `{ Title, Autor, CategoryId, CreationDate?, CreationLocality? }` |
| GET | `/books/:id` | Busca livro por id | — |
| PUT | `/books/:id` | Atualiza um livro | `{ Title?, Autor?, CategoryId?, CreationDate?, CreationLocality? }` |
| DELETE | `/books/:id` | Remove um livro | — |

### Categorias

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/categories` | Lista categorias | — |
| POST | `/categories` | Cadastra uma categoria | `{ Description }` |
| GET | `/categories/:id` | Busca categoria por id | — |
| PUT | `/categories/:id` | Atualiza uma categoria | `{ Description? }` |
| DELETE | `/categories/:id` | Remove uma categoria | — |

### Exemplares de livros (BookCopy)

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/book-copies` | Lista exemplares | — |
| POST | `/book-copies` | Cadastra um exemplar | `{ ISBN?, Editora, TypePrint, PublicationDate, PublicationLocality? }` |
| GET | `/book-copies/:id` | Busca exemplar por id | — |
| PUT | `/book-copies/:id` | Atualiza um exemplar | `{ ISBN?, Editora?, TypePrint?, PublicationDate?, PublicationLocality? }` |
| DELETE | `/book-copies/:id` | Remove um exemplar | — |

### Endereços

| Método | Rota | Descrição | Corpo |
|--------|------|-----------|-------|
| GET | `/addresses` | Lista endereços | — |
| POST | `/addresses` | Cadastra um endereço | `{ Rua, Numero, Complemento, Bairro, Cep, Cidade, Estado, Pais }` |
| GET | `/addresses/:id` | Busca endereço por id | — |
| PUT | `/addresses/:id` | Atualiza um endereço | campos parciais do endereço |
| DELETE | `/addresses/:id` | Remove um endereço | — |

### Formato de erro

Erros retornam o status HTTP adequado e um corpo padronizado:

```json
{ "status": 404, "message": "Usuário não encontrado." }
```

---

## 🗄️ Modelos de dados

Definidos em `src/models/` como classes Sequelize tipadas:

* **User:** `Id`, `Name`, `Birth`, `Email` (único), `Pass`
* **Book:** `Id`, `Title`, `Autor`, `CreationDate`, `CreationLocality`, `CategoryId` (`belongsTo` Category)
* **Category:** `Id`, `Description`
* **BookCopy:** `Id`, `ISBN`, `Editora`, `TypePrint`, `PublicationDate`, `PublicationLocality`
* **Address:** `Id`, `Rua`, `Numero`, `Complemento`, `Bairro`, `Cep`, `Cidade`, `Estado`, `Pais`

Na inicialização (`src/index.ts`), a aplicação chama `sequelize.authenticate()` e `sequelize.sync()`,
criando/atualizando todas as tabelas automaticamente.

---

## 🚀 Pré-requisitos

* [Node.js](https://nodejs.org) **26 ou superior** (LTS atual). O projeto fixa a versão em `.nvmrc`
  (`nvm use` / `fnm use` para adotá-la) e declara `engines.node >= 26`.
* MySQL 8 (ou um container `mysql:8`). Para os testes automatizados **não é necessário** MySQL,
  pois a suíte usa SQLite em memória.
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
   DB_NAME=nome_do_banco
   DB_USER=usuario
   DB_PASSWORD=senha
   DB_HOST=localhost
   DB_PORT=3306
   DB_DIALECT=mysql        # mysql (padrão) ou sqlite

   # Porta do servidor HTTP (padrão: 3000)
   PORT=3000
   ```

   Com `DB_DIALECT=mysql`, as variáveis `DB_NAME`, `DB_USER` e `DB_HOST` são obrigatórias — se
   faltarem, a aplicação falha na inicialização com uma mensagem clara. Com `DB_DIALECT=sqlite`,
   nenhuma credencial é exigida e o banco é um arquivo local (`DB_STORAGE`, padrão `:memory:`),
   configuração usada pela suíte de testes.

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
| `npm test`      | `jest --runInBand` | Executa a suíte de testes automatizados |
| `npm run test:watch` | `jest --watch` | Executa os testes em modo watch |
| `npm run typecheck` | `tsc -p tsconfig.test.json` | Checa os tipos de `src` e `tests` |

---

## 🧪 Testes

A suíte usa **Jest + Supertest** (transformando TypeScript com `@swc/jest`) e cobre as rotas via
requisições HTTP reais contra a aplicação Express. Os testes rodam com **SQLite em memória**
(dialeto configurado por `DB_DIALECT=sqlite`), então **não é necessário ter um MySQL rodando** para
executá-los.

```bash
npm test
```

Cobertura atual (27 casos): criação/listagem/busca/atualização/remoção de usuários, login válido e
inválido, e-mail duplicado, id inválido, recurso e rota inexistentes, e o ciclo CRUD completo de
`books`, `categories`, `book-copies` e `addresses` — verificando os status HTTP esperados
(`200`, `201`, `204`, `400`, `401`, `404`, `409`).

Estrutura:

```
tests/
├── setup-env.ts        # Define DB_DIALECT=sqlite antes de carregar a aplicação
├── helpers/app.ts      # Cria o app Express com banco sincronizado/limpo
├── users.test.ts       # Usuários, login, erros e 404
└── resources.test.ts   # Books, Categories, BookCopies, Addresses
```

Para checar os tipos dos testes:

```bash
npm run typecheck
```

---

## 🛡️ Segurança

A plataforma incentiva boas práticas para a segurança da comunidade:

* Prefira **locais públicos e movimentados** (shoppings, centros culturais, praças e estações) para a troca.
* Nunca compartilhe dados bancários ou endereços residenciais privados pelo chat.

### Limitações conhecidas

* As senhas dos usuários são armazenadas em **texto puro** (sem hash) e a comparação no login é feita
  diretamente. Recomenda-se adicionar hashing (ex.: bcrypt) antes de uso em produção.
* Não há autenticação por token/JWT nas rotas; o login apenas retorna os dados do usuário.

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
