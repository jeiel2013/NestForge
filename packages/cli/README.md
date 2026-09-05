# nestforge

**English** | [Português](README.pt-BR.md)

Interactive CLI that generates NestJS projects from NestForge's [Prisma](../../templates/prisma), [TypeORM](../../templates/typeorm), and [Drizzle](../../templates/drizzle) templates, or without an ORM.

Install the package locally:

```bash
npm install nestforge-generator
```

Run the locally installed CLI:

```bash
npx nestforge
```

For the testing guide, CLI prompts, and complete checklist, see [`TESTING.md`](TESTING.md).

## What already works

- Interactive prompts using `@clack/prompts`;
- TypeScript or JavaScript generation;
- Prisma, TypeORM, Drizzle ORM, or no ORM;
- PostgreSQL, MySQL, SQLite, and MongoDB with Prisma;
- JWT, Session/Cookies, OAuth-only, or no authentication;
- optional Docker;
- optional Swagger/OpenAPI;
- optional global validation with Zod;
- optional Redis, queues, and email;
- optional RBAC and Permissions;
- optional `.env` creation;
- automated tests for generated combinations.

Generated projects include features such as avatar upload, pagination, filters, health checks, metrics, unit tests, and E2E tests.

## Languages

The CLI generates projects in:

- TypeScript;
- JavaScript.

The JavaScript option is produced automatically from the TypeScript templates during generation.

The transformation:

- transpiles `.ts` files;
- removes TypeScript files that should not remain;
- updates `package.json` scripts;
- updates Vitest configuration;
- updates migration configuration;
- adapts commands according to the selected ORM.

## Available ORMs and databases

### Prisma

Available with:

- PostgreSQL;
- MySQL;
- SQLite;
- MongoDB.

The CLI adjusts the `schema.prisma` provider, database URL, and provider-specific resources. MongoDB projects use mapped `ObjectId` fields and `prisma db push` instead of Prisma Migrate.

### TypeORM

Available with:

- PostgreSQL using `pg`;
- MySQL using `mysql2`;
- SQLite using `better-sqlite3`.

The CLI adjusts:

- `DB_TYPE`;
- `DATABASE_URL`;
- column types;
- `DataSource` configuration;
- migration scripts;
- installed driver.

Only the required driver remains in the generated project.

### Drizzle ORM

Available with:

- PostgreSQL using `pg`;
- MySQL using `mysql2`;
- SQLite using `better-sqlite3`.

The Drizzle template includes:

- a database-specific schema;
- Drizzle Kit configuration;
- SQL migrations;
- seed;
- typed database injection;
- health check based on the selected driver;
- `DrizzleSessionStore`;
- transactions adapted to SQLite.

After generation, only the schema and driver for the selected database remain in the project.

### No ORM

The “None” option:

- skips the database and authentication prompts;
- generates no schema, migrations, seed, database driver, or ORM dependency;
- removes authentication, users, and access control;
- keeps independent optional features;
- works with TypeScript and JavaScript.

## Authentication strategies

### JWT

The JWT strategy keeps:

- registration;
- login;
- access tokens;
- refresh tokens;
- refresh token rotation;
- revocation;
- logout;
- Google and GitHub OAuth;
- password recovery;
- email verification.

Password recovery and email verification routes depend on the Redis, queues, and email feature.

### Session/Cookies

The Session/Cookies strategy:

- keeps password registration and login;
- creates a session persisted in the database;
- sends an `httpOnly` cookie;
- regenerates the session after login;
- uses `SessionAuthGuard`;
- protects state-changing operations with CSRF;
- destroys the session on logout;
- starts a session after OAuth callbacks;
- removes JWT-only files, dependencies, and variables.

Each template uses an appropriate integration:

- Prisma uses `@quixo3/prisma-session-store`;
- TypeORM uses `connect-typeorm`;
- Drizzle uses the template's own `DrizzleSessionStore`.

### OAuth-only

The OAuth-only strategy removes password-based flows:

- `register`;
- `login`;
- `forgot-password`;
- `reset-password`;
- `verify-email`.

The following remain available:

- Google OAuth;
- GitHub OAuth;
- access tokens;
- refresh tokens;
- logout;
- protection for authenticated routes.

### No authentication

When “None” is selected, the CLI completely removes:

- `src/auth`;
- `src/users`;
- related DTOs;
- authentication guards;
- authentication tests;
- user tests.

The project keeps only the selected core, such as health checks, metrics, and infrastructure features.

## Optional features

### Docker

When Docker is disabled, the CLI removes:

- `Dockerfile`;
- `docker-compose.yml`.

### Swagger/OpenAPI

When Swagger is disabled, the CLI removes:

- the Swagger bootstrap from `main.ts`;
- the `/docs` route;
- decorators such as `@ApiTags`;
- `@ApiOperation`;
- `@ApiResponse`;
- other documentation decorators.

The Swagger/OpenAPI prompt also controls API documentation. There is no separate second option.

### Global validation

When global validation is disabled:

- `ZodValidationPipe` is not registered in `main.ts`;
- the pipe is not registered in the E2E setup.

DTOs remain as classes, but they are no longer automatically validated by the global pipe.

### Redis, queues, and email

When enabled, the project includes:

- Redis;
- BullMQ;
- email queues;
- Nodemailer;
- Mailpit;
- password recovery;
- email verification;
- Redis health check.

When disabled, related modules, routes, and dependencies are removed.

### RBAC and Permissions

When enabled, the project includes:

- `ADMIN`, `MANAGER`, and `USER` roles;
- granular permissions;
- `RolesGuard`;
- `PermissionsGuard`;
- authorization decorators.

When disabled, RBAC guards, decorators, and constants are removed. Routes still require authentication when an authentication strategy is active, but they no longer require specific permissions.

### `.env` file

When requested, the CLI automatically creates `.env` from the already processed `.env.example`.

## Option status

| Choice | Status |
| --- | --- |
| Language: TypeScript | ✅ Implemented |
| Language: JavaScript | ✅ Implemented |
| ORM: Prisma | ✅ Implemented |
| ORM: TypeORM | ✅ Implemented |
| ORM: Drizzle | ✅ Implemented |
| ORM: None | ✅ Implemented |
| Database: PostgreSQL | ✅ Implemented |
| Database: MySQL | ✅ Implemented |
| Database: SQLite | ✅ Implemented |
| Database: MongoDB | ✅ Implemented with Prisma |
| Auth: JWT | ✅ Implemented |
| Auth: Session/Cookies | ✅ Implemented |
| Auth: OAuth-only | ✅ Implemented |
| Auth: None | ✅ Implemented |

The CLI rejects options that are not implemented before creating the project directory.

## Automated tests

Generator tests are located at:

```text
packages/cli/test/generator.test.ts
```

Run them from `packages/cli`:

```bash
npm test
```

Coverage includes:

- Prisma with PostgreSQL;
- Prisma with MySQL;
- Prisma with SQLite;
- Prisma with MongoDB and JWT;
- Prisma with MongoDB and Session/Cookies;
- TypeORM with SQLite;
- Drizzle with PostgreSQL;
- Drizzle with MySQL;
- Drizzle with SQLite;
- no ORM with TypeScript;
- no ORM with JavaScript, Docker, and Redis;
- JWT;
- Session/Cookies;
- OAuth-only;
- no authentication;
- TypeScript;
- JavaScript;
- Redis removal;
- removal of optional features;
- correct database drivers;
- migration scripts;
- generated schemas;
- rejection of unimplemented options.

## Completed smoke tests

The following combinations were validated with installation, build, unit tests, migrations, seed, and E2E tests:

- TypeScript + TypeORM + SQLite + JWT;
- TypeScript + TypeORM + SQLite + Session/Cookies;
- TypeScript + Drizzle + SQLite + JWT;
- TypeScript + Drizzle + SQLite + Session/Cookies.

PostgreSQL, MySQL, and MongoDB have automated generation and configuration tests. Complete smoke tests that connect to these databases still require local services or Docker; MongoDB must run as a replica set.

## Known limitations

### Redis in earlier templates

In the Prisma and TypeORM templates, `docker-compose.yml` and environment files may still keep Redis and Mailpit services or variables when the feature is disabled.

This extra content does not prevent the project from compiling or running, but it can still be cleaned up to make generation completely minimal.

### No authentication with Prisma

In the Prisma template, `schema.prisma` still keeps models such as `User`, `RefreshToken`, and `OAuthAccount` when no authentication is selected.

`prisma/seed.ts` may also remain related to the demonstration users.

The application code is removed correctly, but the schema may still create tables that are not used.

### Administrative creation with OAuth-only

With OAuth-only, the administrative `POST /users` endpoint still allows a user to be created manually.

The CLI does not yet distinguish the strategy used for login from how an administrator registers users through a management interface.

## Local development

From the monorepo root:

```bash
npm install
cd packages/cli
npm run dev
```

`npm run dev` runs the CLI directly from TypeScript using `tsx`.

To run the tests:

```bash
npm test
```

To test the CLI as an installed package:

```bash
npm run build
npm link
nestforge
```

## Publishing

From `packages/cli`:

```bash
npm run build
npm pack --dry-run
npm publish
```

The build:

1. compiles the CLI;
2. copies the source templates;
3. prepares the package published to npm.

## Next steps

- expand MongoDB support beyond Prisma when a compatible ORM integration is available;
- more complete project and package name validation;
- expand the smoke-test matrix with real PostgreSQL and MySQL services;
- reduce the known limitations in the earlier templates.
