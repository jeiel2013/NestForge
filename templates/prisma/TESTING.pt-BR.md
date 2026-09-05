# Testando o template Prisma

[English](TESTING.md) | **Português**

Este guia valida um projeto gerado a partir do template Prisma do NestForge.

## Pré-requisitos

* Node.js 20 ou superior
* npm 10 ou superior
* Docker para testar PostgreSQL, MySQL, MongoDB, Redis ou Mailpit

SQLite pode ser testado sem Docker.

## Preparar o ambiente

```bash
npm install
cp .env.example .env
cp .env.example .env.test
```

Use bancos diferentes em `.env` e `.env.test`. Nunca execute testes E2E no banco de desenvolvimento ou produção.

Gere o Prisma Client:

```bash
npm run prisma:generate
```

## Aplicar o schema de desenvolvimento

Para PostgreSQL, MySQL ou SQLite:

```bash
npm run prisma:migrate -- --name init
```

Para MongoDB:

```bash
npm run prisma:push
```

Execute o seed quando o projeto gerado incluir autenticação por senha:

```bash
npm run prisma:seed
```

## Validação estática

```bash
npm run build
npm run lint
```

## Testes unitários

```bash
npm test
```

Para cobertura:

```bash
npm run test:cov
```

Os testes unitários simulam Prisma e Redis, portanto não exigem serviços reais.

## Testes E2E

```bash
npm run test:e2e
```

O script `pretest:e2e` executa `prisma migrate deploy` nos bancos relacionais ou `prisma db push` no MongoDB com `.env.test` antes do início da suíte.

Dependendo da estratégia de autenticação gerada, a suíte pode cobrir:

* cadastro e login;
* rotação de refresh token e logout;
* Session/Cookies e CSRF;
* CRUD de usuários;
* RBAC e permissions.

## Verificações específicas por banco

### PostgreSQL

```bash
docker compose up -d postgres
npm run prisma:migrate -- --name init
```

### MySQL

```bash
docker compose up -d mysql
npm run prisma:migrate -- --name init
```

### SQLite

Defina a URL do banco como um arquivo local:

```dotenv
DATABASE_URL="file:./dev.db"
```

Depois execute:

```bash
npm run prisma:migrate -- --name init
npm run build
npm test
npm run test:e2e
```

### MongoDB

O MongoDB deve funcionar como replica set porque o Prisma usa transações em escritas aninhadas. O Docker Compose gerado configura um replica set de nó único:

```bash
docker compose up -d mongodb
npm run prisma:push
npm run build
npm test
npm run test:e2e
```

Use nomes de banco diferentes em `.env` e `.env.test`, como `nestforge` e `nestforge_test`.

## Checklist final

* [ ] As dependências são instaladas corretamente
* [ ] O Prisma Client é gerado
* [ ] As migrations são aplicadas ou o schema MongoDB é enviado
* [ ] O seed executa quando aplicável
* [ ] O build passa
* [ ] O lint passa
* [ ] Os testes unitários passam
* [ ] Os testes E2E passam
* [ ] `.env.test` usa um banco isolado
