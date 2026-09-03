# NestForge

**English** | [Português](README.pt-BR.md)

> Production-ready NestJS starter with Drizzle ORM, Authentication, Docker, Testing, CI/CD and Clean Architecture.

[![CI](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml/badge.svg)](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com)

NestForge is a NestJS starter designed to accelerate the beginning of serious backend projects, with complete authentication, clean architecture, security, and observability already configured. The idea is to clone it, run `docker compose up`, and have an API ready to evolve.

## ✨ Features

- 🔐 **Configurable authentication** — JWT with access/refresh tokens, Drizzle-backed Session/Cookies, OAuth-only, or no authentication
- 🌐 **OAuth** — Google and GitHub, integrated with the selected token or session strategy
- 👥 **RBAC** — Roles (Admin, Manager, User) and granular Permissions
- 🛡️ **Security** — Helmet, CORS, Rate Limiting, validation, and serialization with Zod
- 🗄️ **Database** — Drizzle ORM with PostgreSQL, MySQL, or SQLite
- 📨 **Email** — queues with BullMQ + Redis, locally tested with Mailpit
- 📄 **Automatic documentation** — Swagger
- 🪵 **Structured logs** — Pino
- ✅ **Tests** — unit and integration tests with Vitest
- 🐳 **Docker** — complete environment with a single command
- ⚙️ **CI/CD** — GitHub Actions (build, lint, test)

## 🧱 Stack

| Layer | Technology |
|---|---|
| Framework | NestJS + TypeScript |
| ORM / Query Builder | Drizzle ORM |
| Database | PostgreSQL, MySQL, or SQLite |
| Cache / Queues | Redis + BullMQ |
| Authentication | JWT, Session/Cookies, or OAuth with Passport |
| Validation | Zod + nestjs-zod (schemas automatically become DTOs + Swagger) |
| Docs | Swagger |
| Email (dev) | Mailpit |
| Tests | Vitest |
| CI | GitHub Actions |

## 📁 Folder structure

```
src/
│
├── auth/          # login, sessions/tokens, OAuth, guards, and strategies
├── users/         # user CRUD
├── common/        # decorators, filters, guards, interceptors, pipes, utilities
├── config/        # typed and validated configuration (env)
├── database/      # Drizzle connection, schemas, configuration, migrations, and seed
├── modules/       # additional domain modules
├── shared/        # code shared between modules
├── jobs/          # queues and workers (BullMQ)
├── mail/          # email templates and delivery
└── main.ts
```

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Running with Docker (recommended)

```bash
git clone https://github.com/jeiel2013/nestforge.git
cd nestforge
cp .env.example .env
docker compose up
```

This starts the API and the services selected during generation, such as PostgreSQL or MySQL, Redis, and Mailpit. SQLite projects do not require a database container.

### Running locally

```bash
npm install
cp .env.example .env
npm run migration:generate
npm run migration:migrate
npm run seed
npm run start:dev
```

Drizzle Kit reads `drizzle.config.ts`, generates SQL migrations in `drizzle/`, and uses only the schema for the database selected during project generation.

Swagger documentation is available at `http://localhost:3000/docs`.

## 🗺️ Roadmap

- [x] JWT authentication
- [x] Session/Cookies authentication
- [x] Google/GitHub OAuth
- [x] OAuth-only strategy
- [x] Generation without authentication
- [x] Refresh Token
- [x] Docker
- [x] CI (build, lint, test)
- [x] OAuth (Google/GitHub)
- [x] File uploads
- [x] Queues (BullMQ)
- [x] Transactional email
- [x] Complete RBAC (granular permissions)
- [x] Complete integration tests
- [x] Complete documentation (Swagger + architecture guide)

See the detailed [ROADMAP.md](ROADMAP.md).

### Configuring social login (OAuth)

To enable login through Google and GitHub, create an OAuth App with each provider and fill in `.env`:

```bash
APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- **Google**: create credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and configure the callback URL as `{APP_URL}/auth/google/callback`.
- **GitHub**: create an OAuth App under `Settings > Developer settings > OAuth Apps` and configure the callback URL as `{APP_URL}/auth/github/callback`.

Then access `GET /auth/google` or `GET /auth/github`. On callback, the API issues access/refresh tokens or establishes a cookie-based session according to the selected strategy. On first access, an account is created and linked to the provider.

### Session/Cookies authentication

When the project is generated with Session/Cookies, registration and login create a session persisted in the `sessions` table. `DrizzleSessionStore` integrates `express-session` with the selected database without depending on Prisma- or TypeORM-specific stores. The identifier is sent in the `nestforge.sid` cookie, configured with `httpOnly`, `sameSite=lax`, and `secure` in production.

Configure `.env`:

```bash
SESSION_SECRET=use-a-secret-with-at-least-32-characters
SESSION_MAX_AGE=604800000
```

### Password recovery and email verification

Every registration (`POST /auth/register`) automatically sends a verification email. Emails are queued with BullMQ/Redis and processed by a worker that sends them over SMTP. In development, everything goes to Mailpit (`http://localhost:8025`), so nothing is actually sent over the internet.

| Route | What it does |
|---|---|
| `POST /auth/forgot-password` | Receives an `email` and queues the password reset link (the response is always generic and does not reveal whether the email exists) |
| `POST /auth/reset-password` | Receives a `token` + `password` and changes the password; it also revokes the user's active refresh tokens |
| `GET /auth/verify-email?token=...` | Confirms the email from the received link |

Reset and verification tokens expire after 1 hour and 24 hours, respectively, and can only be used once.

## 🔑 Roles & Permissions

| Role | Description |
|---|---|
| `ADMIN` | full system access |
| `MANAGER` | manages users and reports |
| `USER` | standard access |

Each role has a fixed set of permissions mapped in `src/common/constants/role-permissions.ts`:

| Permission | ADMIN | MANAGER | USER |
|---|:---:|:---:|:---:|
| `user:create` | ✅ | ❌ | ❌ |
| `user:read` | ✅ | ✅ | ✅ |
| `user:update` | ✅ | ✅ | ❌ |
| `user:delete` | ✅ | ❌ | ❌ |
| `report:read` | ✅ | ✅ | ❌ |

On routes, use `@Permissions(Permission.UserCreate)` to require a specific permission or `@Roles(Role.ADMIN)` when role-based control is enough. Both guards (`RolesGuard` and `PermissionsGuard`) run globally and only block a route when it has the corresponding decorator.

## 👥 Users: pagination, filters, and avatar

`GET /users` accepts query parameters for paginating and filtering the list:

```bash
GET /users?page=2&limit=20&search=jeiel&role=ADMIN
```

| Parameter | Description |
|---|---|
| `page` | current page (default: 1) |
| `limit` | items per page, up to 100 (default: 10) |
| `search` | searches by name or email (case-insensitive) |
| `role` | filters by `ADMIN`, `MANAGER`, or `USER` |

The response uses the format `{ data, meta: { total, page, limit, totalPages } }`.

To change the authenticated user's avatar:

```bash
curl -X POST http://localhost:3000/users/me/avatar \
  -H "Authorization: Bearer <accessToken>" \
  -F "file=@/path/to/photo.png"
```

PNG, JPEG, and WEBP files up to 2 MB are accepted. The file is saved under `./uploads/avatars` and served at `/uploads/avatars/<file>`.

## 🛡️ Security: serialization and CSRF

All input validation (`body`, `query`) uses **Zod** through [`nestjs-zod`](https://github.com/BenLorantfy/nestjs-zod): each DTO is a `z.object({...})` transformed into a class with `createZodDto(schema)` and globally validated by `ZodValidationPipe`. During bootstrap, `patchNestJsSwagger()` teaches Swagger to read these schemas automatically, so validation (Zod) and documentation (`@ApiProperty`) do not need to be duplicated as they would with `class-validator`. Exported schemas (for example, `createUserSchema`) can also be reused and combined (such as `updateUserSchema`, which is simply `createUserSchema.partial()`).

- 🪵 **Observability** — structured logs with Pino, health checks (`/health`), and Prometheus metrics (`/metrics`)

The seed creates three test accounts, one for each role:

| Email | Password | Role |
|---|---|---|
| `admin@nestforge.dev` | `admin123` | ADMIN |
| `manager@nestforge.dev` | `manager123` | MANAGER |
| `user@nestforge.dev` | `user1234` | USER |

## 📈 Observability

`GET /health` returns the aggregated status of the API — database, Redis, memory (heap/RSS), and disk space — using `@nestjs/terminus`. `DrizzleHealthIndicator` queries the selected database's native client, and each check appears individually in the response.

`GET /metrics` exposes Prometheus-format metrics through `prom-client`: standard Node.js metrics (CPU, memory, event loop), plus `http_request_duration_seconds` (histogram) and `http_requests_total` (counter), both with `method`, `route`, and `status_code` labels. Simply point a Prometheus scrape job at this route.

## 🧪 Tests

```bash
npm run test          # unit tests
npm run test:e2e      # integration tests (E2E)
npm run test:cov      # coverage
```

E2E tests (`test/*.e2e-spec.ts`) start the real application with NestJS and Drizzle and make requests with `supertest`, using the isolated database defined in `.env.test`. Before the first run, generate the migrations:

```bash
npm run drizzle:generate
npm run test:e2e
```

The `pretest:e2e` script automatically applies migrations to this database before every run. Each test cleans the tables before running (`test/utils/clean-database.ts`), so nothing needs to be reset manually between runs. Current coverage includes the complete authentication flow (registration, login, refresh, logout, duplicate email, invalid credentials) and user CRUD with RBAC (ADMIN can do everything, USER can read but cannot create, `/users/me`, and access without a token).

Unit tests (`src/**/*.spec.ts`) run in isolation with the Drizzle instance and `ioredis` mocked through `vi.fn()` and `vi.mock()`. They do not require a real database or Redis. Coverage includes `AuthService`, `UsersService`, `RolesGuard`, `PermissionsGuard`, `DrizzleHealthIndicator`, and `RedisHealthIndicator`.

## 📚 Additional documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — how the project is organized and why certain design decisions were made (Zod vs. class-validator, code-based vs. database-based permissions, BullMQ, etc.)
- [TESTING.md](TESTING.md) — how to validate migrations, build, unit tests, and E2E tests
- [docs/adding-a-module.md](docs/adding-a-module.md) — step-by-step instructions for adding a new feature according to the project's conventions

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete guide.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE).

---

Made by [Jeiel Alves](https://github.com/jeiel2013) · [jeieldev.com.br](https://jeieldev.com.br)
