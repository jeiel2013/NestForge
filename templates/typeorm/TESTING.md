# Testing the TypeORM template

**English** | [Português](TESTING.pt-BR.md)

This guide validates a project generated from the NestForge TypeORM template.

## Prerequisites

* Node.js 20 or later
* npm 10 or later
* Docker when testing PostgreSQL, MySQL, Redis, or Mailpit

SQLite can be tested without Docker. Make sure the installed `better-sqlite3` version supports your Node version.

## Prepare the environment

```bash
npm install
cp .env.example .env
cp .env.example .env.test
```

Use different databases in `.env` and `.env.test`.

## Generate and apply a migration

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
```

Run the seed when the generated project includes password authentication:

```bash
npm run seed
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

Unit tests mock TypeORM repositories and Redis, so they do not require real services.

## E2E tests

```bash
npm run test:e2e
```

The `pretest:e2e` script applies migrations using `.env.test` before the suite starts.

Depending on the generated authentication strategy, the suite may cover JWT, Session/Cookies, CSRF, user CRUD, RBAC, and permissions.

## Database-specific checks

### PostgreSQL

```bash
docker compose up -d postgres
npm run migration:run
```

### MySQL

```bash
docker compose up -d mysql
npm run migration:run
```

### SQLite

Set the database configuration to SQLite and run:

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run build
npm test
npm run test:e2e
```

Check the native driver when necessary:

```bash
npm ls better-sqlite3
```

## Final checklist

* [ ] Dependencies install successfully
* [ ] The correct database driver is installed
* [ ] Migration is generated and reviewed
* [ ] Migrations are applied
* [ ] Seed runs when applicable
* [ ] Build passes
* [ ] Lint passes
* [ ] Unit tests pass
* [ ] E2E tests pass
* [ ] `.env.test` uses an isolated database
