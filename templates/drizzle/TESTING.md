# Testing the Drizzle template

**English** | [Português](TESTING.pt-BR.md)

This guide validates a project generated from the NestForge Drizzle template.

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

## Generate and apply migrations

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

Review the SQL files generated under `drizzle/` before applying them to shared or production environments.

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

Unit tests mock the Drizzle instance and Redis, so they do not require real services.

## E2E tests

Generate migrations at least once before the first E2E run:

```bash
npm run drizzle:generate
npm run test:e2e
```

The `pretest:e2e` script applies migrations using `.env.test` before the suite starts.

Depending on the generated authentication strategy, the suite may cover JWT, Session/Cookies, CSRF, user CRUD, RBAC, and permissions.

## Database-specific checks

### PostgreSQL

```bash
docker compose up -d postgres
npm run drizzle:migrate
```

### MySQL

```bash
docker compose up -d mysql
npm run drizzle:migrate
```

### SQLite

Set the database URL to a local file:

```dotenv
DATABASE_URL="file:./dev.db"
```

Then run:

```bash
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run build
npm test
npm run test:e2e
```

Check the dependencies and migration artifacts:

```bash
npm ls drizzle-orm drizzle-kit better-sqlite3
```

```powershell
Get-ChildItem .\drizzle -Recurse
```

## SQLite transaction behavior

`better-sqlite3` uses synchronous transactions. Transaction callbacks must not return a `Promise`, and write operations use methods such as `.run()`.

PostgreSQL and MySQL use asynchronous transaction callbacks with `await`.

## Final checklist

* [ ] Dependencies install successfully
* [ ] The correct database driver is installed
* [ ] Migrations are generated and reviewed
* [ ] Migrations are applied
* [ ] Seed runs when applicable
* [ ] Build passes
* [ ] Lint passes
* [ ] Unit tests pass
* [ ] E2E tests pass
* [ ] `.env.test` uses an isolated database
