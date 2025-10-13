# Empresor Full-Stack

Este repositório agora contém uma aplicação **full stack** construída com Next.js 15 que expõe uma API própria, utiliza Postgres através do Knex e integra autenticação segura com **Auth0** (PKCE + cookies HTTP-only). A camada de frontend consome as rotas internas (`/api`) para manter a experiência unificada.

## Requisitos

- Node.js 20+
- Banco Postgres acessível via `DATABASE_URL`
- Uma aplicação Auth0 com [Password Realm habilitada](https://auth0.com/docs/authenticate/password-based/password-realm) (para uso de refresh token) e variáveis abaixo preenchidas.

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

Variáveis principais:

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`: credenciais da aplicação Auth0
- `AUTH0_AUDIENCE`: API Audience configurada na Auth0 (opcional)
- `AUTH0_DB_CONNECTION`: nome da conexão (ex.: `Username-Password-Authentication`)
- `AUTH0_REDIRECT_URI`: `http://localhost:3000/api/auth/callback` no ambiente local
- `AUTH0_POST_LOGOUT_REDIRECT_URI`: URL para onde o usuário volta após logout
- `AUTH0_COOKIE_SECRET`: string aleatória usada para assinar cookies (ex.: `openssl rand -base64 32`)
- `DATABASE_URL`: string de conexão Postgres

2. Instale dependências e execute migrations:

```bash
npm install
npx knex --knexfile knexfile.ts migrate:latest
```

> ⚠️ Em ambientes offline pode não ser possível instalar pacotes adicionais. Os scripts existentes utilizam apenas dependências já presentes no projeto.

3. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Fluxo de Autenticação

- `/api/auth/login`: inicia o fluxo PKCE com a Auth0 e armazena a verifier em cookie HTTP-only.
- `/api/auth/callback`: troca o `code` por tokens (access/refresh) e cria cookie de sessão assinado.
- `/api/auth/session`: expõe os dados básicos do usuário e renova tokens quando necessário.
- `/api/auth/logout`: limpa o cookie local e redireciona para o logout da Auth0.
- Rotas de suporte: `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/refresh`.

As páginas protegidas (`/dashboard/*`) e a API `pdf-jobs` são guardadas por `middleware.ts`, garantindo que apenas usuários autenticados avancem.

## API interna

- `GET /api/pdf-jobs` – lista solicitações de geração de PDF pertencentes ao usuário atual.
- `POST /api/pdf-jobs` – cria nova solicitação (`quoteId`, `s3Key?`).
- `GET /api/pdf-jobs/:id` – detalhes de uma solicitação.
- `PATCH /api/pdf-jobs/:id` – atualiza status/`s3Key`.

Todas as rotas utilizam o mesmo cookie HTTP-only gerado pela Auth0 para validar a sessão. O acesso ao banco Postgres é feito via `Knex`, usando a conexão definida em `src/server/db/client.ts`.

## Como testar

1. Inicie o servidor (`npm run dev`).
2. Acesse `/login` e clique em "Entrar com Auth0" – você será redirecionado ao hosted login.
3. Após o retorno, navegue até `/dashboard`. A middleware irá garantir que apenas usuários autenticados entrem.
4. Utilize ferramentas como `curl` ou `Insomnia` para chamar as rotas `/api/pdf-jobs` (os cookies do navegador autorizam).

## Scripts úteis

- `npm run dev` – ambiente de desenvolvimento com Next.js
- `npm run build` – build de produção
- `npm run start` – inicia servidor já buildado
- `npm run lint` – verificação de lint

## Observações

- Caso `DATABASE_URL` não esteja definido, as rotas da API retornarão erro de conexão.
- Os tokens são mantidos apenas em cookies HTTP-only; o front-end nunca manipula secrets diretamente.
- Ajuste `NEXT_PUBLIC_API_BASE_URL` caso a API rode em outro host/porta.
