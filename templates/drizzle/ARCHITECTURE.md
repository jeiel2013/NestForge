# Architecture

**English** | [Português](ARCHITECTURE.pt-BR.md)

This document explains how NestForge with Drizzle ORM is organized and why certain design decisions were made.

## Overview

```text
Request → main.ts (global pipes, filters, and interceptors)
  → Authentication and authorization guards
  → Controller (receives a DTO and delegates)
  → Service (business rules)
  → DrizzleDatabase
  → PostgreSQL, MySQL, or SQLite
  → ClassSerializerInterceptor
  → Response
```

Controllers do not access the database directly. Every operation goes through a service, keeping business rules centralized and testable.

## Module structure

A domain module normally follows this structure:

```text
<module>/
├── dto/                    # Zod schemas and DTOs
├── entities/               # response and serialization classes, when required
├── <module>.controller.ts  # receives the request and calls the service
├── <module>.service.ts     # business rules and Drizzle queries
├── <module>.service.spec.ts
└── <module>.module.ts      # controllers, providers, and exports
```

Tables are not located inside each module. They are defined in:

```text
src/database/schema/
├── postgres.schema.ts
├── mysql.schema.ts
├── sqlite.schema.ts
└── index.ts
```

During generation, the CLI keeps only the schema for the selected database.

## Database connection

The global connection is created by `DatabaseModule`.

It provides two tokens:

* `DATABASE_CLIENT`: the native database client;
* `DRIZZLE_DATABASE`: the typed Drizzle instance.

Services receive the database with:

```ts
constructor(
  @InjectDatabase()
  private readonly database: DrizzleDatabase,
) {}
```

The `@InjectDatabase()` decorator centralizes the injection token and prevents domain modules from knowing details about how the connection is created.

The native client is used only when the driver-specific API is required, such as in the health check and application shutdown.

## Schemas by dialect

PostgreSQL, MySQL, and SQLite differ in types, defaults, UUIDs, dates, and upsert commands.

For this reason, the template keeps three schemas:

* `postgres.schema.ts`, using `drizzle-orm/pg-core`;
* `mysql.schema.ts`, using `drizzle-orm/mysql-core`;
* `sqlite.schema.ts`, using `drizzle-orm/sqlite-core`.

CLI markers remove schemas and imports for unselected databases. The generated project ends up with only one dialect and one driver.

## Design decisions

### Why Zod instead of class-validator?

With Zod, the schema is the primary source for validation and documentation.

`nestjs-zod` transforms schemas into DTOs, while `patchNestJsSwagger()` allows Swagger to interpret these schemas.

This reduces duplication between validation and documentation decorators.

### Why use Drizzle directly in services?

Drizzle's query builder already provides typed queries that remain close to SQL.

Creating an additional generic layer for every operation would add indirection without an immediate benefit for the starter.

A custom persistence layer can still be created when the domain requires multiple data sources or complex access rules.

In unit tests, the Drizzle instance is replaced with objects containing `vi.fn()`, without initializing a real database.

### Why use versioned migrations?

Schema changes must be recorded in SQL migrations so they can be reviewed and applied predictably.

The main commands are:

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

The first compares the schemas with existing snapshots and generates files in `drizzle/`. The second applies pending migrations to the configured database.

For rapid development, the following is also available:

```bash
npm run drizzle:push
```

`push` is useful for prototypes, but versioned migrations are preferable in shared projects and production.

### Why are SQLite transactions different?

PostgreSQL and MySQL use asynchronous drivers. Their transactions receive asynchronous callbacks and queries executed with `await`.

`better-sqlite3` is synchronous. With this driver, the transaction callback cannot return a `Promise`, and operations are executed with methods such as `.run()`.

The template uses database markers to generate the correct implementation for each driver.

### Why are permissions a map in code?

The `ROLE_PERMISSIONS` map is suitable for projects with a few fixed roles and makes permissions easy to audit.

If the project needs dynamic roles, the map can be replaced with tables such as `roles`, `permissions`, and `role_permissions`.

### Why BullMQ for email delivery?

SMTP is an external operation that can fail or take time.

Putting delivery in a queue allows the request to respond after the work is queued, while the worker processes delivery and subsequent retries.

### Why store refresh token hashes?

A JWT cannot be revoked before it expires. Storing its hash enables:

* logout;
* refresh token rotation;
* invalidation after a password change;
* prevention of revoked token reuse.

The original token is not persisted. Each refresh token also receives a unique `jti` to prevent collisions when two tokens are issued in the same second.

### Why does `UserEntity` still exist?

In the Drizzle template, `UserEntity` is not a database entity.

It is a response class used by `ClassSerializerInterceptor`. The `@Exclude()` decorator prevents `passwordHash` from being sent by the API.

Tables and persistence types are located in the Drizzle schemas.

### Why does Session/Cookies use persistent storage?

The Session/Cookies strategy uses `express-session` with `DrizzleSessionStore`.

Sessions are stored in the `sessions` table instead of process memory. This allows the application to restart or scale without losing all active sessions.

The store implements reading, writing, updating, removal, and expiration using the selected database.

### How does CSRF protection work?

With Session/Cookies, the application uses a CSRF token associated with the session.

Requests that change state must send it through the header:

```http
x-csrf-token: <token>
```

The middleware compares the received value with the token stored in the session.

With JWT and a Bearer token, the browser does not automatically send the credential in a cookie. Therefore, this CSRF flow is not required.

## Authentication strategies

### JWT

1. Registration or login validates the user.
2. `TokenService` issues access and refresh tokens.
3. The refresh token hash is stored in the database.
4. `JwtAuthGuard` validates the Bearer token.
5. Refresh revokes the previous token and issues a new pair.
6. Logout revokes the refresh token.

### Session/Cookies

1. Registration or login validates the user.
2. The session is regenerated to prevent session fixation.
3. The user and CSRF token are stored in the session.
4. The browser receives the `nestforge.sid` cookie.
5. `SessionAuthGuard` protects the routes.
6. Logout destroys the session.

### OAuth

Google and GitHub are linked through the `oauth_accounts` table.

If the email has not been registered yet, a user is created and associated with the provider. The callback result follows the selected strategy: JWT tokens or a persistent session.

## Main tables

The schemas may include:

* `users`;
* `oauth_accounts`;
* `refresh_tokens`, when token authentication is enabled;
* `sessions`, when Session/Cookies is enabled;
* `password_reset_tokens`, when password recovery is enabled;
* `email_verification_tokens`, when email verification is enabled.

Conditional tables use markers so that only the selected features remain in the generated project.

## Where to add a module

To add a new domain according to the template conventions, see [Adding a Module](docs/adding-a-module.md).

---
