# 📚 bibliotech — API de Escambo de Livros

API REST em **Node.js + TypeScript** para uma plataforma de troca (escambo) de livros entre
leitores. O backend expõe endpoints para gerenciar usuários, livros, categorias, exemplares
e endereços, persistindo os dados via **Sequelize** em um banco **MySQL**.

> O pacote está registrado como `bibliotech` no `package.json`.

---

## ✨ Funcionalidades implementadas

* **Usuários:** cadastro, consulta (por id e por e-mail), login e atualização/exclusão.
* **Livros:** cadastro, listagem (com a categoria associada), busca por id, atualização e exclusão.
* **Categorias:** CRUD de categorias de livros (entidade `Category`, associada a `Book`).
* **Exemplares (`BookCopy`):** CRUD de exemplares físicos dos livros (ISBN, editora, tipo de impressão etc.).
* **Endereços (`Address`):** CRUD de endereços (rua, número, bairro, CEP, cidade, estado, país).

> As entidades **BookCopy**, **Category** e **Address** já possuem controller, rotas e model,
> mas as suas rotas ainda **não estão registradas** na aplicação. Veja a seção
> [Rotas disponíveis](#-rotas-disponíveis).

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Linguagem:** TypeScript (compilado com `tsc`, executado em dev com `ts-node-dev`)
* **Framework HTTP:** Express 4
* **ORM:** Sequelize 6
* **Banco de Dados:** MySQL (`mysql2`)
* **Utilitários:** `cors`, `dotenv`, `http-status-codes`

---

## 📁 Estrutura do projeto

```
.
├── src
│   ├── index.ts                # Bootstrap do Express e registro das rotas
│   ├── ConnectionDB.ts         # Conexão com o banco (Sequelize)
│   ├── @types                  # Tipos (UserType, LoginType)
│   ├── Services
│   │   └── UserService.ts      # Regras de negócio de usuário (CRUD + Login)
│   ├── controller              # Controllers por entidade
│   │   ├── UserController.ts
│   │   ├── BookController.ts
│   │   ├── BookCategoryController.ts
│   │   ├── BookCopyController.ts
│   │   └── AddressController.ts
│   ├── entity                  # Models Sequelize
│   │   ├── UserEntity.ts
│   │   ├── BookEntity.ts
│   │   ├── CategoryEntity.ts
│   │   ├── BookCopyEntity.ts
│   │   └── AddressEntity.ts
│   └── router                  # Definição das rotas Express
│       ├── status.routes.ts
│       ├── user.routes.ts
│       ├── book.routes.ts
│       ├── bookCategory.routes.ts
│       ├── bookCopy.routes.ts
│       └── address.routes.ts
├── documentation               # Requisitos e diagrama de caso de uso
├── dist                        # Saída da compilação (gerada por `npm run build`)
├── .env.example                # Modelo das variáveis de ambiente
├── package.json
└── tsconfig.json
```

---

## 🚀 Pré-requisitos

* [Node.js](https://nodejs.org) (v18 ou superior)
* [Git](https://git-scm.com)
* Um servidor **MySQL** acessível

---

## ⚙️ Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SteveSilvas/Books_Barter_Node.git
   cd Books_Barter_Node
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto, com base no `.env.example`:

   ```env
   # Banco de Dados (usado por src/ConnectionDB.ts)
   DB_NAME=nome_do_banco
   DB_USER=usuario
   DB_PASSWORD=senha
   DB_HOST=localhost
   DB_PORT=3306
   DB_DIALECT=mysql

   # Porta do servidor HTTP (o app lê a variável PORT; o padrão é 3000)
   PORT=3000
   ```

   > Observação: o `.env.example` do repositório traz a chave `SERVER_PORT`, mas o
   > `src/index.ts` lê `process.env.PORT`. Use `PORT` para definir a porta da API.

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

## 🔌 Rotas disponíveis

Todas as rotas registradas atualmente em `src/index.ts`:

| Método | Rota                  | Descrição                          | Corpo da requisição |
|--------|-----------------------|------------------------------------|---------------------|
| GET    | `/status`             | Health check da API                | —                   |
| GET    | `/users`              | Lista todos os usuários            | —                   |
| POST   | `/users/add`          | Cadastra um usuário                | `{ Name, Birth, Email, Pass }` |
| POST   | `/users/login`        | Autentica um usuário               | `{ Email, Pass }`   |
| GET    | `/users/:id`          | Busca usuário por id               | —                   |
| GET    | `/users/email/:email` | Busca usuário por e-mail           | —                   |
| PUT    | `/users/update`       | Atualiza um usuário                | `{ Id, Name, Birth, Email, Pass }` |
| DELETE | `/users/delete`       | Remove um usuário                  | `{ Id }`            |
| GET    | `/books`              | Lista livros (ordem decrescente por id, com a categoria) | — |
| POST   | `/books/add`          | Cadastra um livro                  | `{ data: { Title, Autor, CategoryId, CreationDate, CreationLocality } }` |
| GET    | `/books/:Id`          | Busca livro por id                 | —                   |
| PUT    | `/books/update`       | Atualiza um livro                  | `{ Id, Title, Autor, CreationDate, CreationLocality }` |
| DELETE | `/books/delete`       | Remove um livro                    | `{ Id }`            |

### Rotas definidas mas não registradas

Os arquivos abaixo existem, mas as rotas estão comentadas em `src/index.ts` e, portanto,
não respondem ainda:

* `src/router/bookCategory.routes.ts` — `/category`, `/category/add`, `/category/:Id`, `/category/update`, `/category/delete`
* `src/router/bookCopy.routes.ts` — `/books`, `/books/add`, `/books/:Id`, `/books/update`, `/books/delete`
* `src/router/address.routes.ts` — `/address`, `/address/add`, `/address/:Id`, `/boaddressoks/update`, `/address/delete`
  (atenção: a rota de atualização de endereço tem um erro de digitação no caminho — `boaddressoks`)

---

## 🗄️ Modelos de dados

Definidos em `src/entity/` com Sequelize:

* **User:** `Id`, `Name`, `Birth`, `Email` (único), `Pass`
* **Book:** `Id`, `Title`, `Autor`, `CreationDate`, `CreationLocality`, `CategoryId` (`belongsTo` Category)
* **Category:** `Id`, `Description`
* **BookCopy:** `Id`, `ISBN`, `Editora`, `TypePrint`, `PublicationDate`, `PublicationLocality`
* **Address:** `Id`, `Rua`, `Numero`, `Complemento`, `Bairro`, `Cep`, `Cidade`, `Estado`, `Pais`

O model `UserEntity` chama `database.sync()`, o que cria/atualiza a tabela de usuários
automaticamente na inicialização. Os demais models não executam `sync` (as chamadas estão
comentadas), sendo necessário criá-los manualmente no banco.

---

## 📜 Scripts npm

| Script | Comando | Descrição |
|--------|---------|-----------|
| `npm run dev`   | `ts-node-dev --respawn --transpile-only ... src/index.ts` | Ambiente de desenvolvimento |
| `npm run build` | `tsc -p .` | Compila o TypeScript para `dist/` |
| `npm start`     | `node ./` | Executa o build de produção |
| `npm test`      | `echo Teste executado com sucesso` | Script de teste (placeholder) |

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
