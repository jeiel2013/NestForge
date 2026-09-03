# Architecture

**English** | [Português](ARCHITECTURE.pt-BR.md)

This document explains how NestForge is organized and why certain design decisions were made. The goal is for someone new to the project to understand the “why,” not only the “what.”

## Overview

```
Request → main.ts (global pipes/filters/interceptors)
        → Guards (JwtAuthGuard → RolesGuard → PermissionsGuard)
        → Controller (validates through a Zod DTO, delegates to the service)
        → Service (business rules, calls Prisma)
        → Prisma → PostgreSQL
        → Response (passes through ClassSerializerInterceptor before becoming JSON)
```

Each domain module (`auth`, `users`, `mail`, `health`, `metrics`) follows the same structure:

```
<module>/
├── dto/                     # input — one Zod schema + createZodDto per DTO
├── entities/                # output — classes with @Exclude() for sensitive fields
├── <module>.controller.ts   # orchestrates only: receives request, calls service, returns
├── <module>.service.ts      # actual business rules
└── <module>.module.ts       # wires everything together and declares exports
```

Controllers never communicate with Prisma directly — they always go through the service. This keeps business logic testable without starting the entire application (which is why unit tests mock only Prisma, not all of Nest).

## Design decisions (short ADR)

### Why Zod (with `nestjs-zod`) instead of `class-validator`?

`class-validator` requires duplicated information: validation decorators (`@IsEmail()`) and documentation decorators (`@ApiProperty()`) describe the same thing in two different ways, and one can easily become outdated relative to the other. With Zod, the schema is the single source of truth — `nestjs-zod` generates the DTO and Swagger documentation from it. See `src/*/dto/*.dto.ts` and `patchNestJsSwagger()` in `src/main.ts`.

### Why Prisma without a repository layer on top?

Prisma Client is effectively already a type-safe repository. Adding an abstraction layer on top merely to “follow the pattern” would add indirection without a real benefit in this project (there is no plan to replace the ORM). Services call `this.prisma.<model>` directly.

### Why are permissions a fixed map in code (`ROLE_PERMISSIONS`) instead of a database table?

A fully dynamic permission system (`roles`, `permissions`, and `role_permissions` tables) is overkill for a starter — most projects created from it will have 3–5 fixed roles. Keeping the mapping in `src/common/constants/role-permissions.ts` makes it explicitly auditable: the entire permission array for every role is visible in one file. If the project grows enough to require permissions configurable at runtime (for example, an administrator creating custom roles through the UI), then migrating to database tables becomes worthwhile.

### Why BullMQ for email instead of sending it directly in the request?

Sending email is a network operation (SMTP) that can fail or take time. If it happened inside `POST /auth/register`, instability in the email provider would make registration slow or show an error even when the account had been created. The queue decouples these operations: the request responds as soon as the job is queued, and `MailProcessor` handles delivery (with retries) in the background.

### Why store hashed refresh tokens in the database instead of trusting only the JWT?

A JWT cannot be revoked before it expires. Storing the refresh token hash in the database makes it possible to invalidate sessions properly (logout, password change, stolen refresh token) — this is why `resetPassword` revokes all active refresh tokens for the user.

### Why use `UserEntity` + `ClassSerializerInterceptor` instead of only a Prisma `select`?

Both intentionally coexist. The `select` avoids unnecessarily retrieving `passwordHash` from the database; `@Exclude()` on the entity is a second barrier — even if a future query forgets the `select`, the field does not escape into the HTTP response. This is defense in depth, not redundancy.

### Why is CSRF disabled by default?

The API uses a Bearer token in the `Authorization` header, not a session cookie. CSRF exploits the browser automatically sending cookies across origins, which does not apply here. The middleware is ready in `src/common/middleware/csrf.middleware.ts` for projects that adapt the starter to store the token in a cookie.

## Authentication flow in detail

1. `POST /auth/register` or `/login` → `AuthService` generates an `accessToken` (15 min) + `refreshToken` (7 days) pair and stores the refresh token hash in the database.
2. Protected routes pass through `JwtAuthGuard`, which validates the `accessToken` and populates `req.user` with `{ id, email, role }` through `JwtStrategy`.
3. `RolesGuard` and `PermissionsGuard` read `req.user.role` and decide whether to allow the route using its `@Roles()` / `@Permissions()` decorators.
4. When the `accessToken` expires, the client calls `POST /auth/refresh` — the old refresh token is revoked and a new pair is issued (token rotation).

## Where to add something new

If you are adding a new feature (rather than only changing auth/users), see [`docs/adding-a-module.md`](docs/adding-a-module.md) — it is a step-by-step guide that applies the conventions above to a module built from scratch.
