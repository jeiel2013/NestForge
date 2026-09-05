# Testing the `nestforge` CLI

**English** | [Português](TESTING.pt-BR.md)

Guide for validating the CLI, generated combinations, and Prisma, TypeORM, and Drizzle projects.

## 1. Prerequisites

* Node.js 20 or later;
* npm 10 or later;
* Docker only for real tests with PostgreSQL, MySQL, MongoDB, or Redis.

SQLite can be tested without Docker.

Dependencies such as `better-sqlite3` may require a version compatible with the Node version in use.

## 2. Prepare the monorepo

In PowerShell:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge
npm install
```

Then enter the CLI directory:

```powershell
Set-Location .\packages\cli
```

## 3. Run the automated tests

From `packages/cli`:

```bash
npm test
```

This command runs:

```bash
tsx --test test/generator.test.ts
```

The suite automatically validates:

* Prisma with PostgreSQL and JWT;
* Prisma with MySQL;
* Prisma with SQLite;
* Prisma with MongoDB and JWT;
* Prisma with MongoDB and Session/Cookies;
* Prisma with MongoDB in JavaScript;
* OAuth-only;
* passwordless authentication;
* Session/Cookies authentication;
* projects without authentication;
* TypeORM with SQLite and Session/Cookies;
* TypeORM with PostgreSQL and MySQL;
* Drizzle with SQLite and JWT;
* Drizzle with SQLite and Session/Cookies;
* Drizzle with PostgreSQL and MySQL;
* JavaScript with Prisma;
* JavaScript with TypeORM;
* JavaScript with Drizzle;
* removal of disabled features;
* removal of unnecessary dependencies;
* selection of the correct driver;
* migration script configuration;
* marker processing;
* generation without an ORM in TypeScript and JavaScript;
* rejection of MongoDB with unsupported ORMs and invalid no-ORM combinations.

Expected result:

```text
pass 19
fail 0
```

The number of tests may increase as new cases are added. The main criterion is that no tests fail.

## 4. Run the CLI in development

From `packages/cli`:

```bash
npm run dev
```

The command runs the CLI directly from TypeScript:

```bash
tsx src/index.ts
```

The project directory is created in the current directory.

To generate a project outside the repository using the local code:

```powershell
Set-Location C:\Users\Jeiel\Music

& '.\nestforge\node_modules\.bin\tsx.cmd' `
  '.\nestforge\packages\cli\src\index.ts'
```

## 5. Test as an installed CLI

From the CLI directory:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build
npm link
```

Then, from another directory:

```powershell
Set-Location C:\Users\Jeiel\Music
nestforge
```

To remove the global link:

```bash
npm unlink -g nestforge
```

## 6. Interactive flow

The CLI displays up to 11 questions. The RBAC question appears only when an authentication strategy is selected.

| No. | Question | Options | Status |
| -: | ------------------------ | ------------------------------------------- | ---------------------- |
| 1 | Project name | Free text | ✅ |
| 2 | Language | TypeScript or JavaScript | ✅ Both |
| 3 | ORM / Query Builder | Prisma, TypeORM, Drizzle, or None | ✅ All options |
| 4 | Database | PostgreSQL, MySQL, SQLite, or MongoDB | ✅ MongoDB with Prisma; SQL with all ORMs |
| 5 | Docker | Yes or no | ✅ |
| 6 | Swagger/OpenAPI | Yes or no | ✅ |
| 7 | Global validation with Zod | Yes or no | ✅ |
| 8 | Redis, queues, and email | Yes or no | ✅ |
| 9 | Authentication | JWT, Session/Cookies, OAuth-only, or None | ✅ |
| 10 | RBAC and Permissions | Yes or no | ✅ Conditional |
| 11 | Create `.env` | Yes or no | ✅ |

### Project name

| Situation | Expected result |
| ----------------------- | ---------------------------- |
| A name is provided | Uses the provided name |
| Enter is pressed without a name | Uses `my-nest-api` |
| Ctrl+C | Cancels without creating a project |
| Directory already exists | Displays an error and does not overwrite it |
| Uppercase letters, whitespace, or unsupported characters | Rejects the name |
| Path separator, absolute path, or npm scope | Rejects the name before writing files |
| More than 214 characters | Rejects the name |
| npm or Windows reserved name | Rejects the name |

The same validation runs in both the interactive prompt and the generator API.

### Language

| Option | Result |
| ---------- | ------------------------------------------------------- |
| TypeScript | Keeps `.ts` source and configuration files |
| JavaScript | Transpiles the template and updates scripts and configuration |

During JavaScript generation:

* `.ts` files are converted to `.js`;
* Vitest configuration is changed to JavaScript;
* migration configuration is updated;
* `tsconfig.json` and TypeScript-only files are removed;
* scripts no longer depend on Nest CLI or TypeScript runners;
* TypeScript-only dependencies are removed.

### ORM / Query Builder

| Option | Result |
| ----------- | ------------------------- |
| Prisma | ✅ Generates the Prisma template |
| TypeORM | ✅ Generates the TypeORM template |
| Drizzle ORM | ✅ Generates the Drizzle template |
| None | ✅ Generates without database or authentication integration |

### Database

| Option | Result |
| ---------- | ---------------------------------------- |
| PostgreSQL | ✅ Works with Prisma, TypeORM, and Drizzle |
| MySQL | ✅ Works with Prisma, TypeORM, and Drizzle |
| SQLite | ✅ Works with Prisma, TypeORM, and Drizzle |
| MongoDB | ✅ Works with Prisma; rejected with TypeORM and Drizzle |

The CLI must remove drivers for databases that were not selected.

| Database | TypeORM/Drizzle driver |
| ---------- | ---------------------- |
| PostgreSQL | `pg` |
| MySQL | `mysql2` |
| SQLite | `better-sqlite3` |

### Docker

When disabled, the following files must be removed:

```text
Dockerfile
docker-compose.yml
```

### Swagger/OpenAPI

When disabled:

* the Swagger bootstrap is removed;
* the `/docs` route is no longer available;
* Swagger decorators are removed;
* `@nestjs/swagger` is removed from the dependencies.

### Global validation

When disabled:

* `ZodValidationPipe` is removed from the bootstrap;
* the pipe is also removed from the E2E setup.

DTOs remain in the project, but are no longer validated by the global pipe.

### Redis, queues, and email

When disabled, the following must be removed:

* `MailModule`;
* `MailService`;
* `MailProcessor`;
* BullMQ;
* Redis;
* Redis health indicator;
* password recovery by email;
* email verification;
* related dependencies.

### JWT authentication

The project must keep:

* registration;
* login;
* `TokenService`;
* `JwtStrategy`;
* `JwtAuthGuard`;
* access tokens;
* refresh tokens;
* rotation and revocation;
* logout;
* Google and GitHub OAuth.

It must remove features exclusive to Session/Cookies.

### Session/Cookies

The project must keep:

* registration;
* login;
* `SessionService`;
* `SessionAuthGuard`;
* `express-session`;
* the `nestforge.sid` cookie;
* the `/auth/csrf-token` endpoint;
* CSRF protection;
* session persistence;
* Google and GitHub OAuth.

Persistence used by each ORM:

| ORM | Store |
| ------- | ------------------------------ |
| Prisma | `@quixo3/prisma-session-store` |
| TypeORM | `connect-typeorm` |
| Drizzle | `DrizzleSessionStore` |

It must remove files, dependencies, variables, and scripts exclusive to JWT.

### OAuth-only

The project must remove:

* password registration;
* password login;
* password recovery;
* password reset;
* email verification;
* password-based DTOs;
* password-based tests.

It must keep:

* Google OAuth;
* GitHub OAuth;
* token issuance;
* refresh;
* logout;
* protection for authenticated routes.

### No authentication

The project must completely remove:

```text
src/auth
src/users
```

The RBAC question must not appear.

### RBAC and Permissions

When disabled, the following must be removed:

* `RolesGuard`;
* `PermissionsGuard`;
* role decorators;
* permission decorators;
* permission constants;
* RBAC rules from controllers.

Routes still require authentication when an authentication strategy is active.

### Creating `.env`

When enabled:

```text
.env.example → .env
```

When disabled, the CLI must display:

```bash
cp .env.example .env
```

## 7. Final commands displayed

### Prisma

```bash
cd <project-name>
npm install
docker compose up -d <services>
npx prisma migrate dev
npm run start:dev
```

The Docker line appears only when Docker is enabled and there is at least one service to start.

For Prisma with MongoDB, the database step is:

```bash
npm run prisma:push
npm run prisma:seed
```

MongoDB uses `db push` instead of Prisma Migrate and must run as a replica set for transactional operations.

### TypeORM

```bash
cd <project-name>
npm install
docker compose up -d <services>
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run seed
npm run start:dev
```

### Drizzle

```bash
cd <project-name>
npm install
docker compose up -d <services>
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run start:dev
```

The `npm run seed` command appears only for JWT and Session/Cookies.

### No ORM

```bash
cd <project-name>
npm install
npm run start:dev
```

There are no database, migration, seed, or authentication commands.

## 8. General generation checklist

* [ ] The default name creates `my-nest-api`
* [ ] A custom name updates `package.json`
* [ ] A custom name updates the README title
* [ ] An existing directory is not overwritten
* [ ] Ctrl+C cancels without a stack trace
* [ ] `.env` is created when requested
* [ ] `.env` is not created when declined
* [ ] Disabling Docker removes its files
* [ ] Disabling Swagger removes its code and dependency
* [ ] Disabling validation removes the global pipe
* [ ] Disabling Redis removes its code and dependencies
* [ ] Disabling RBAC removes guards, decorators, and constants
* [ ] JWT removes Session/Cookies features
* [ ] Session/Cookies removes JWT features
* [ ] OAuth-only removes password flows
* [ ] No authentication removes auth and users
* [x] The “None” ORM removes database and authentication integration
* [x] MongoDB is accepted with Prisma
* [x] MongoDB is rejected with TypeORM and Drizzle before creating the directory

## 9. Prisma checklist

* [ ] TypeScript + Prisma + PostgreSQL + JWT
* [ ] TypeScript + Prisma + MySQL + JWT
* [ ] TypeScript + Prisma + SQLite + JWT
* [x] TypeScript + Prisma + MongoDB + JWT
* [x] TypeScript + Prisma + MongoDB + Session/Cookies
* [x] JavaScript + Prisma + MongoDB
* [ ] JavaScript + Prisma
* [ ] Prisma + Session/Cookies
* [ ] Prisma + OAuth-only
* [ ] Prisma + no authentication

## 10. TypeORM checklist

* [x] TypeScript + TypeORM + SQLite + JWT
* [x] TypeScript + TypeORM + SQLite + Session/Cookies
* [x] JavaScript + TypeORM + SQLite
* [x] TypeORM + PostgreSQL configuration
* [x] TypeORM + MySQL configuration
* [ ] Real smoke test with TypeORM + PostgreSQL
* [ ] Real smoke test with TypeORM + MySQL

## 11. Drizzle checklist

* [x] TypeScript + Drizzle + SQLite + JWT
* [x] TypeScript + Drizzle + SQLite + Session/Cookies
* [x] JavaScript + Drizzle
* [x] Drizzle + PostgreSQL configuration
* [x] Drizzle + MySQL configuration
* [x] Correct PostgreSQL schema
* [x] Correct MySQL schema
* [x] Correct SQLite schema
* [x] Removal of unselected drivers
* [x] Drizzle scripts in TypeScript
* [x] Drizzle scripts in JavaScript
* [ ] Real smoke test with Drizzle + PostgreSQL
* [ ] Real smoke test with Drizzle + MySQL

Real smoke tests with PostgreSQL and MySQL require the databases to be available locally or through Docker.

### No ORM checklist

* [x] TypeScript without ORM, database, or authentication
* [x] JavaScript without ORM, with Docker and Redis
* [x] Prisma dependencies and scripts are removed
* [x] Database environment variables are removed
* [x] Invalid no-ORM combinations are rejected before creating the directory

## 12. Prisma smoke test with SQLite

After generating the project:

```powershell
Set-Location .\<prisma-project>
```

```bash
npm install
npm run prisma:generate
npm run build
npm test
npm run prisma:migrate -- --name init
npm run seed
npm run test:e2e
```

Check the scripts available in `package.json`, as they may vary according to the template version.

## 13. TypeORM smoke test with SQLite

After generating the project:

```powershell
Set-Location .\<typeorm-project>
```

```bash
npm install
npm run build
npm test
npm run migration:generate -- .\src\database\migrations\InitialSchema
npm run migration:run
npm run seed
npm run test:e2e
```

Check the driver:

```bash
npm ls better-sqlite3
```

### Validated TypeORM smoke tests

Validated configurations:

```text
TypeScript + TypeORM + SQLite + JWT
TypeScript + TypeORM + SQLite + Session/Cookies
```

Results:

* installation completed;
* build completed;
* unit tests completed;
* migration generated;
* migration applied;
* seed executed;
* E2E tests completed.

## 14. Drizzle smoke test with SQLite

After generating the project:

```powershell
Set-Location .\<drizzle-project>
```

```bash
npm install
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run build
npm test
npm run test:e2e
```

`pretest:e2e` automatically applies migrations using the database defined in `.env.test`.

Check the dependencies:

```bash
npm ls drizzle-orm drizzle-kit better-sqlite3
```

Check the migration artifacts:

```powershell
Get-ChildItem .\drizzle -Recurse
```

### Validated Drizzle smoke test with JWT

Configuration:

```text
Language: TypeScript
ORM: Drizzle
Database: SQLite
Redis: No
Authentication: JWT
RBAC: Yes
```

Result:

* installation completed;
* migrations generated;
* migrations applied;
* seed executed;
* build completed;
* unit tests completed;
* E2E tests completed.

### Validated Drizzle smoke test with Session/Cookies

Configuration:

```text
Language: TypeScript
ORM: Drizzle
Database: SQLite
Redis: No
Authentication: Session/Cookies
RBAC: Yes
```

Result:

* installation completed;
* migrations generated;
* migrations applied;
* seed executed;
* build completed;
* unit tests completed;
* CSRF tests completed;
* session E2E tests completed.

## 15. Scan the Drizzle template

Check for improper Prisma or TypeORM references:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern `
    '@prisma/client|PrismaService|PrismaModule|@nestjs/typeorm|typeorm|TypeOrm|DataSource|InjectRepository|Repository'
```

References in executable files indicate something that must be reviewed.

Historical or comparative references in documentation must be evaluated individually.

Check the markers:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern 'nestforge:feature'
```

## 16. Check the published package

From the CLI directory:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build
```

Check the copied templates:

```powershell
Test-Path .\templates\prisma
Test-Path .\templates\typeorm
Test-Path .\templates\drizzle
```

Expected result:

```text
True
True
True
```

Check the package contents:

```bash
npm pack --dry-run
```

The package must include:

```text
dist/
templates/prisma/
templates/typeorm/
templates/drizzle/
README.md
TESTING.md
package.json
```

## 17. Scope not implemented yet

* MongoDB support beyond Prisma;
* real PostgreSQL smoke tests;
* real MySQL smoke tests;
* final publication to npm.

MongoDB combinations with TypeORM or Drizzle must return a clear error before the project directory is created.
