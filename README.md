# 📚 EscamboLiterário

Plataforma web para troca (escambo) de livros entre leitores. O sistema permite que usuários cadastrados publiquem seus livros com fotos, conversem em tempo real para negociar trocas e agendem encontros presenciais em locais públicos seguros.

---

## ✨ Funcionalidades Principais

* **Autenticação Social:** Login rápido e seguro integrado com o **Google OAuth 2.0**.
* **Catálogo de Livros:** Cadastro, edição e busca de exemplares disponíveis para troca, contendo título, autor, estado de conservação e descrição.
* **Upload de Imagens:** Envio de fotos reais dos livros armazenadas diretamente em serviço de **Cloud Bucket** (ex: AWS S3, Google Cloud Storage ou Supabase Storage).
* **Chat em Tempo Real:** Sistema de mensagens diretas entre usuários interessados para negociação dos títulos.
* **Agendamento de Encontros:** Ferramenta integrada ao chat para sugerir e confirmar data, horário e **locais públicos** (bibliotecas, cafés, estações de metrô, parques) para a realização da troca.

---

## 🛠️ Tecnologias Utilizadas

> *Nota: Adapte esta seção conforme a stack real do seu projeto.*

* **Frontend:** React / Next.js, Tailwind CSS
* **Backend:** Node.js / Express (ou NestJS)
* **Banco de Dados:** PostgreSQL / Prisma ORM
* **Autenticação:** NextAuth.js / Firebase Auth / Passport (Google OAuth)
* **Armazenamento de Arquivos:** AWS S3 / Google Cloud Storage / Cloudflare R2
* **Comunicação em Tempo Real:** Socket.io / WebSockets

---

## 🚀 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
* [Node.js](https://nodejs.org) (v18 ou superior)
* [Git](https://git-scm.com)
* Uma conta no **Google Cloud Console** (para credenciais OAuth)
* Um **Bucket** configurado (AWS S3, GCS ou compatível)

---

## ⚙️ Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com
   cd escambo-literario
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example` e preencha com suas chaves:

   ```env
   # Banco de Dados
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/escambo_db"

   # Autenticação Google OAuth
   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"
   NEXTAUTH_SECRET="sua-chave-secreta-aleatoria"
   NEXTAUTH_URL="http://localhost:3000"

   # Configuração do Bucket (Exemplo AWS S3)
   BUCKET_NAME="nome-do-seu-bucket"
   BUCKET_REGION="us-east-1"
   BUCKET_ACCESS_KEY="sua-access-key"
   BUCKET_SECRET_KEY="sua-secret-key"
   ```

4. **Execute as migrações do banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 🛡️ Segurança nos Encontros

A plataforma incentiva boas práticas para a segurança da comunidade:
* O agendamento sugere preferencialmente **locais públicos e movimentados** (shoppings, centros culturais, praças públicas e estações).
* Recomendamos nunca compartilhar dados bancários ou endereços residenciais privados pelo chat.

---

## 🤝 Como Contribuir

1. Faça um **Fork** do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Faça o commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`).
4. Faça o push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um **Pull Request**.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
