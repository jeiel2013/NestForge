# Testing the Prisma template

**English** | [Português](TESTING.pt-BR.md)

This guide validates a project generated from the NestForge Prisma template.

## Prerequisites

* Node.js 20 or later
* npm 10 or later
* Docker when testing PostgreSQL, MySQL, Redis, or Mailpit

SQLite can be tested without Docker.

## Prepare the environment

```bash
npm install
cp .env.example .env
cp .env.example .env.test
```

Use different databases in `.env` and `.env.test`. Never run E2E tests against the development or production database.

Generate Prisma Client:

```bash
npm run prisma:generate
```

## Apply the development schema

```bash
npm run prisma:migrate -- --name init
```

Run the seed when the generated project includes password authentication:

```bash
npm run prisma:seed
```

## Static validation

```bash
npm run build
npm run lint
```

## Unit tests

```bash
npm test
```

For coverage:

```bash
npm run test:cov
```

Unit tests mock Prisma and Redis, so they do not require real services.

## E2E tests

```bash
npm run test:e2e
```

The `pretest:e2e` script runs `prisma migrate deploy` with `.env.test` before the suite starts.

Depending on the generated authentication strategy, the suite may cover:

* registration and login;
* refresh token rotation and logout;
* Session/Cookies and CSRF;
* user CRUD;
* RBAC and permissions.

## Database-specific checks

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

Set the database URL to a local file:

```dotenv
DATABASE_URL="file:./dev.db"
```

Then run:

```bash
npm run prisma:migrate -- --name init
npm run build
npm test
npm run test:e2e
```

## Final checklist

* [ ] Dependencies install successfully
* [ ] Prisma Client is generated
* [ ] Migrations are applied
* [ ] Seed runs when applicable
* [ ] Build passes
* [ ] Lint passes
* [ ] Unit tests pass
* [ ] E2E tests pass
* [ ] `.env.test` uses an isolated database
