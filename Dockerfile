# syntax=docker/dockerfile:1

# --- Etapa de build: compila o TypeScript para dist/ ---
FROM node:26-alpine AS build
WORKDIR /app

# Instala todas as dependências (inclui devDependencies, necessárias para o tsc)
COPY package.json package-lock.json ./
RUN npm ci

# Compila o projeto
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Etapa de runtime: apenas dependências de produção + dist ---
FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Instala apenas as dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Código compilado
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "./dist/index.js"]
