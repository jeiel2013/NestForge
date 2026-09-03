# Roadmap

**English** | [Português](ROADMAP.pt-BR.md)

This roadmap makes it clear what is ready and where contributions are possible. PRs for any open item are very welcome — open an issue first for large changes so the approach can be aligned.

## Authentication

- [x] Login
- [x] Registration
- [x] Logout
- [x] Refresh Token
- [x] Forgot Password
- [x] Reset Password
- [x] Email Verification
- [x] Google OAuth
- [x] GitHub OAuth

## Users

- [x] Basic CRUD
- [x] Pagination and advanced filters
- [x] Avatar upload

## RBAC

- [x] Roles (Admin, Manager, User)
- [x] Granular permissions (`user:create`, `report:read`, etc.)
- [x] Guard combining roles + permissions

## Security

- [x] Helmet
- [x] CORS
- [x] Rate Limit
- [x] Validation (Zod + nestjs-zod, integrated with Swagger through `createZodDto`)
- [x] Serialization (output interceptor)
- [x] CSRF (when required)

## Database

- [x] Prisma
- [x] PostgreSQL
- [x] Migrations
- [x] Complete seed (roles, permissions, administrator user)

## Infrastructure

- [x] Docker / docker-compose (API, Postgres, Redis, Mailpit)
- [x] GitHub Actions CI (build, lint, test)
- [ ] Automated deployment (Railway/Fly.io example)

## Observability

- [x] Structured logging with Pino
- [x] Health checks (`/health`)
- [x] Metrics (optional Prometheus)

## Jobs & Email

- [x] BullMQ queue
- [x] Transactional email delivery (Mailpit in development)
- [x] Email templates

## Tests

- [x] Unit test structure (Vitest)
- [x] Integration tests (auth + users)

## Documentation

- [x] Initial README
- [x] Complete Swagger with request/response examples
- [x] Architecture guide (ADR / design decisions)
- [x] “How to add a new module” guide
