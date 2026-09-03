# Roadmap

**English** | [Português](ROADMAP.pt-BR.md)

This roadmap presents the current state of the NestForge Drizzle ORM template and the areas that can still evolve.

For large changes, open an issue before the pull request to align the implementation.

## CLI and generation

* [x] Project generation with Drizzle ORM
* [x] TypeScript
* [x] JavaScript generated from the TypeScript template
* [x] PostgreSQL
* [x] MySQL
* [x] SQLite
* [x] Removal of optional features through markers
* [x] Removal of unused dependencies
* [x] Final commands adapted to Drizzle
* [x] Automated tests for generated combinations

## Database

* [x] Drizzle ORM
* [x] PostgreSQL-specific schema
* [x] MySQL-specific schema
* [x] SQLite-specific schema
* [x] Dynamic Drizzle Kit configuration
* [x] Migration generation
* [x] Migration execution
* [x] Seed with users for the default roles
* [x] Health check using the selected driver
* [x] Transactions adapted to `better-sqlite3`
* [x] Isolated database cleanup in E2E tests

## Authentication

* [x] JWT strategy
* [x] Session/Cookies strategy
* [x] OAuth-only strategy
* [x] Project without authentication
* [x] Login
* [x] Registration
* [x] Logout
* [x] Access token
* [x] Refresh token
* [x] Refresh token revocation
* [x] Password recovery
* [x] Password reset
* [x] Email verification
* [x] Google OAuth
* [x] GitHub OAuth
* [x] Sessions persisted with `DrizzleSessionStore`
* [x] CSRF protection for Session/Cookies

## Users and authorization

* [x] User CRUD
* [x] Pagination
* [x] Search and filters
* [x] Avatar upload
* [x] `ADMIN`, `MANAGER`, and `USER` roles
* [x] Granular permissions
* [x] Role and permission guards
* [x] Optional RBAC removal through the CLI

## Security

* [x] Helmet
* [x] Configurable CORS
* [x] Rate limit
* [x] Validation with Zod and `nestjs-zod`
* [x] Response serialization
* [x] CSRF protection for session authentication
* [x] `httpOnly` cookies
* [x] Secure cookies in production
* [x] Environment variable validation

## Optional features

* [x] Docker and Docker Compose
* [x] Swagger/OpenAPI
* [x] Global validation
* [x] Redis
* [x] BullMQ
* [x] Transactional email
* [x] Mailpit for development
* [x] RBAC and Permissions
* [x] Optional `.env` file generation

## Observability

* [x] Structured logging with Pino
* [x] Application health check
* [x] Drizzle health check
* [x] Redis health check
* [x] Memory check
* [x] Disk space check
* [x] Prometheus-format metrics
* [x] HTTP metrics

## Tests

* [x] Unit tests with Vitest
* [x] E2E tests with Supertest
* [x] JWT authentication tests
* [x] Session/Cookies tests
* [x] CSRF tests
* [x] User tests
* [x] RBAC tests
* [x] Drizzle health check tests
* [x] Separate test database
* [x] Table cleanup between tests
* [x] Smoke test with Drizzle, SQLite, and JWT
* [x] Smoke test with Drizzle, SQLite, and Session/Cookies

## CI and infrastructure

* [x] GitHub Actions
* [x] Reproducible installation with `npm ci`
* [x] Migration generation and execution in CI
* [x] Lint
* [x] Build
* [x] Unit tests
* [x] E2E tests
* [x] PostgreSQL, MySQL, and Redis services according to generation
* [ ] Automated deployment example
* [ ] Staging environment configuration example

## Documentation

* [x] Template README
* [x] Architecture guide
* [x] Guide for adding a module with Drizzle
* [x] Feature marker guide
* [x] Migration documentation
* [x] Testing documentation
* [x] Authentication documentation
* [x] Observability documentation

## Outside this template's scope

MongoDB is not part of the current Drizzle template. MongoDB support belongs to the general CLI roadmap and will require its own persistence strategy.
