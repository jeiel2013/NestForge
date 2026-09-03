# Architecture

**English** | [Português](ARCHITECTURE.pt-BR.md)

This document explains how NestForge with TypeORM is organized and why certain design decisions were made.

## Overview

```text
Request → main.ts (global pipes, filters, and interceptors)
  → Authentication and authorization guards
  → Controller (validates DTO and delegates)
  → Service (business rules)
  → TypeORM Repository
  → PostgreSQL, MySQL, or SQLite
  → ClassSerializerInterceptor
  → Response
```

Each domain module follows the same structure:

```text
<module>/
├── dto/                    # Zod schemas and DTOs
├── entities/               # entities persisted by TypeORM
├── <module>.controller.ts  # receives the request and calls the service
├── <module>.service.ts     # business rules
├── <module>.service.spec.ts
└── <module>.module.ts      # dependencies, repositories, and exports
```

Controllers do not access repositories directly. Every operation goes through the service, keeping business rules centralized and testable.

Modules register their entities with:

TypeOrmModule.forFeature([
    UserEntity,
])

Services receive repositories with:

@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>

The global connection is located in src/database/database.module.ts. PostgreSQL-, MySQL-, and SQLite-specific options are located in src/database/typeorm-options.ts.

## Design decisions

### Why Zod instead of class-validator?

With Zod, the schema is the primary source for validation and documentation. nestjs-zod transforms schemas into DTOs, while patchNestJsSwagger() allows Swagger to interpret these schemas.

This reduces duplication between validation and documentation decorators.

### Why use TypeORM repositories directly?

Repository<Entity> already provides a testable, typed persistence abstraction. Creating another generic repository layer on top would add indirection without benefiting this starter.

Unit tests replace repositories with objects containing vi.fn(), without starting a database or the complete Nest application.

An additional layer can be created later if the project requires complex persistence rules or multiple data sources.

### Why is synchronize disabled?

The template uses:

synchronize: false

Database changes must go through versioned migrations. This prevents automatic and potentially destructive schema changes, especially in production.

Migrations are generated and run with:

npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run

### Why are permissions a map in code?

The ROLE_PERMISSIONS map is suitable for projects with a few fixed roles and makes permissions easy to audit.

If the project needs dynamically created roles, the map can be replaced with entities such as Role, Permission, and RolePermission.

### Why BullMQ for email delivery?

SMTP is an external operation that can fail or take time. Putting delivery in a queue allows the request to respond after the work is queued, while MailProcessor handles delivery and subsequent retries.

### Why store refresh token hashes?

A JWT cannot be revoked before it expires. Storing the hash enables:

  - logout;
  - refresh token rotation;
  - invalidation after a password change;
  - prevention of revoked token reuse.

The original token is not persisted.

### Why does UserEntity use @Exclude()?

The repository needs to access passwordHash during operations such as login, but this field must never appear in an HTTP response.

@Exclude() combined with ClassSerializerInterceptor creates a serialization barrier that prevents the hash from leaking.

### Why does Session/Cookies use persistent storage?

The Session/Cookies strategy uses express-session with connect-typeorm. Sessions are stored in the sessions table instead of process memory.

This allows the application to restart or scale without losing all active sessions.

### How does CSRF protection work?

With Session/Cookies, the application uses a CSRF token associated with the session. Requests that change state must send this token through the header:

x-csrf-token

The middleware compares the received token with the token stored in the session.

With JWT and a Bearer token, the browser does not automatically send the credential in a cookie, so this CSRF flow is not required.

## Authentication strategies

### JWT

1. Registration or login validates the user.
2. TokenService issues access and refresh tokens.
3. The refresh token hash is stored in the database.
4. JwtAuthGuard validates the Bearer token.
5. Refresh revokes the previous token and issues a new pair.
6. Logout revokes the refresh token.

### Session/Cookies

1. Registration or login validates the user.
2. The session is regenerated to prevent session fixation.
3. The user and CSRF token are stored in the session.
4. The browser receives the nestforge.sid cookie.
5. SessionAuthGuard protects the routes.
6. Logout destroys the session.

### OAuth

Google and GitHub are linked through OAuthAccountEntity. If the email has not been registered yet, a user is created and associated with the provider.

## Database and entities

The main entities are:

- UserEntity;
- OAuthAccountEntity;
- RefreshTokenEntity, when tokens are enabled;
- SessionEntity, when Session/Cookies is enabled;
- password recovery and email verification entities, when applicable.

Conditional entities use generator markers so that only the required files and relationships remain in the final project.

## Where to add a module

To add a new domain, see docs/adding-a-module.md (docs/adding-a-module.md).

---
