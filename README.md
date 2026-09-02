# NestForge

**English** | [Português](README.pt-BR.md)

NestForge monorepo: an interactive CLI that generates production-ready NestJS projects with authentication, authorization, databases, queues, observability, tests, and documentation.

```bash
npx nestforge
```

## Repository structure

```text
/
├── packages/
│   └── cli/       → `nestforge` package published on npm
└── templates/
    ├── prisma/    → NestJS template with Prisma
    ├── typeorm/   → NestJS template with TypeORM
    └── drizzle/   → NestJS template with Drizzle ORM
```

- `packages/cli` — CLI source code, including prompts, generator, transformations, and automated tests.
- `templates/prisma` — complete NestJS project using Prisma.
- `templates/typeorm` — complete NestJS project using TypeORM and repositories.
- `templates/drizzle` — complete NestJS project using Drizzle ORM.

During the build, the templates are copied into the CLI package so that they remain available after publication to npm.

## What the CLI does

When you run `npx nestforge`, you answer the interactive prompts and receive a NestJS project configured according to your choices.

## What the CLI configures

1. **Project name** — free text — ✅ Available
2. **Language** — TypeScript or JavaScript — ✅ Both available
3. **ORM / Query Builder** — Prisma, TypeORM, or Drizzle — ✅ Available
4. **ORM / Query Builder** — None — ⏳ Not implemented yet
5. **Database** — PostgreSQL, MySQL, or SQLite — ✅ Available
6. **Database** — MongoDB — ⏳ Not implemented yet
7. **Docker** — yes or no — ✅ Real toggle
8. **Swagger/OpenAPI** — yes or no — ✅ Real toggle
9. **Global validation with Zod** — yes or no — ✅ Real toggle
10. **Redis, queues, and email** — yes or no — ✅ Real toggle
11. **Authentication** — JWT, Session/Cookies, OAuth-only, or None — ✅ All available
12. **RBAC and Permissions** — yes or no — ✅ Real toggle
13. **Create `.env`** — yes or no — ✅ Real toggle

Legend:

- ✅ Currently works.
- ⏳ Not implemented yet; the CLI rejects the option with a clear message.

The JavaScript option is generated automatically from the TypeScript templates while the project is being created.

## Available ORMs

### Prisma

The Prisma template includes:

- Prisma Client;
- declarative schema;
- migrations;
- seed;
- PostgreSQL, MySQL, and SQLite;
- Prisma store for Session/Cookies;
- Prisma-based health check.

### TypeORM

The TypeORM template includes:

- decorator-based entities;
- repositories injected with `TypeOrmModule.forFeature`;
- a database-specific `DataSource`;
- migrations;
- seed;
- PostgreSQL with `pg`;
- MySQL with `mysql2`;
- SQLite with `better-sqlite3`;
- persistent store with `connect-typeorm`;
- `DataSource`-based health check.

### Drizzle ORM

The Drizzle template includes:

- database-specific typed schemas;
- typed query builder;
- Drizzle Kit configuration;
- SQL migrations;
- seed;
- PostgreSQL with `pg`;
- MySQL with `mysql2`;
- SQLite with `better-sqlite3`;
- `DrizzleSessionStore` for Session/Cookies;
- health check using the selected native driver;
- transactions adapted to SQLite behavior.

The CLI keeps only the template, schema, and driver required for the selected ORM and database.

## Template features

### Authentication

The available strategies are:

- JWT with access and refresh tokens;
- database-backed Session/Cookies;
- Google and GitHub OAuth;
- OAuth-only;
- no authentication.

The JWT strategy includes:

- refresh token rotation;
- unique refresh tokens;
- revocation;
- logout;
- password recovery;
- email verification when Redis and email are enabled.

The Session/Cookies strategy includes:

- `httpOnly` cookie;
- session regeneration;
- database persistence;
- `SessionAuthGuard`;
- CSRF protection with a token associated with the session;
- logout with session destruction.

With the “None” option, the `src/auth` and `src/users` directories are removed.

### RBAC and Permissions

The templates include:

- `ADMIN`, `MANAGER`, and `USER` roles;
- granular permissions;
- `RolesGuard`;
- `PermissionsGuard`;
- decorators for protecting endpoints.

### Users

- CRUD;
- pagination;
- filters;
- search;
- avatar upload;
- safe serialization;
- removal of `passwordHash` from responses.

### Redis, queues, and email

When enabled:

- Redis;
- BullMQ;
- email queues;
- Nodemailer;
- Mailpit in development;
- password recovery;
- email verification;
- Redis health check.

When disabled, related files and dependencies are removed.

### Security

- Helmet;
- configurable CORS;
- rate limiting;
- Zod;
- serialization with `ClassSerializerInterceptor`;
- password hashing with bcrypt;
- refresh token hashing;
- CSRF protection for Session/Cookies;
- secure cookies in production;
- environment variable validation.

### Observability

- structured logging with Pino;
- health check at `/health`;
- Prometheus metrics at `/metrics`;
- database, Redis, memory, and disk indicators.

### Tests

- unit tests with Vitest;
- E2E tests with Supertest;
- isolated test database;
- helpers for initializing the application;
- table cleanup between tests;
- JWT and Session/Cookies-specific tests;
- CSRF tests;
- RBAC tests;
- health check tests.

### Docker and CI

- multi-stage Dockerfile;
- Docker Compose;
- PostgreSQL or MySQL according to the selected option;
- SQLite without an external service;
- Redis and Mailpit when applicable;
- GitHub Actions;
- migration generation and execution;
- build, lint, unit tests, and E2E tests.

## Current validation

The following TypeORM combinations were validated with complete smoke tests:

- TypeScript + TypeORM + SQLite + JWT;
- TypeScript + TypeORM + SQLite + Session/Cookies.

The following Drizzle combinations were validated with complete smoke tests:

- TypeScript + Drizzle + SQLite + JWT;
- TypeScript + Drizzle + SQLite + Session/Cookies.

The smoke tests initially ran:

```bash
npm install
npm run build
npm test
```

For TypeORM, they also ran:

```bash
npm run migration:generate
npm run migration:run
npm run seed
npm run test:e2e
```

For Drizzle, they also ran:

```bash
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run test:e2e
```

The generator's automated tests also cover:

- PostgreSQL;
- MySQL;
- SQLite;
- Prisma;
- TypeORM;
- Drizzle;
- TypeScript;
- JavaScript;
- JWT;
- OAuth-only;
- Session/Cookies;
- projects without authentication;
- removal of optional features;
- rejection of options that are not implemented yet.

PostgreSQL and MySQL have automated coverage for generation, schema configuration, and removal of unused drivers. Full smoke tests for these databases still require local services or Docker.

## Template documentation

### Prisma

- [Prisma template README](templates/prisma/README.md)
- [Prisma template architecture](templates/prisma/ARCHITECTURE.md)
- [Prisma template documentation](templates/prisma/docs)

### TypeORM

- [TypeORM template README](templates/typeorm/README.md)
- [TypeORM template architecture](templates/typeorm/ARCHITECTURE.md)
- [TypeORM template documentation](templates/typeorm/docs)

### Drizzle

- [Drizzle template README](templates/drizzle/README.md)
- [Drizzle template architecture](templates/drizzle/ARCHITECTURE.md)
- [Drizzle template roadmap](templates/drizzle/ROADMAP.md)
- [Drizzle template documentation](templates/drizzle/docs)

## Local development

From the monorepo root:

```bash
npm install
cd packages/cli
npm run dev
```

To run the CLI's automated tests:

```bash
npm test
```

To test it as an installed CLI:

```bash
npm run build
npm link
nestforge
```

The complete guide is available in [TESTING](packages/cli/TESTING.md).

## Publishing

```bash
cd packages/cli
npm run build
npm pack --dry-run
npm publish
```

The build compiles the CLI and copies the Prisma, TypeORM, and Drizzle templates into the published package.

## Roadmap

Planned next steps:

- an option without an ORM;
- MongoDB;
- complete package name validation;
- expand the smoke-test matrix with databases running as real services;
- automated deployment examples.

Detailed status is available in the [CLI README](packages/cli/README.md).

## License

MIT — see:

- [Prisma template license](templates/prisma/LICENSE)
- [TypeORM template license](templates/typeorm/LICENSE)
- [Drizzle template license](templates/drizzle/LICENSE)
