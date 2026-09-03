# Contributing to NestForge

**English** | [Português](CONTRIBUTING.pt-BR.md)

Thank you for considering contributing! 🎉

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/nestforge.git`
3. Create a branch: `git checkout -b feat/feature-name`
4. Start the environment: `docker compose up` (or `npm install` + `npm run start:dev`)
5. Make your changes
6. Run tests and lint before committing: `npm run test && npm run lint`
7. Commit according to the convention below
8. Open a Pull Request describing what was changed and why

## Commit convention

We use Portuguese commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona autenticação via Google OAuth
fix: corrige validação do refresh token
docs: atualiza guia de instalação
test: adiciona testes de integração para users
refactor: extrai lógica de hash para utils
chore: atualiza dependências
```

## Code standards

- If your code is related to an optional CLI feature (Swagger, Redis, RBAC, etc.), mark it according to [`docs/feature-markers.md`](docs/feature-markers.md). Without this, the CLI cannot remove the code when someone disables the feature.
- Strict TypeScript (no unjustified `any`)
- Always validate input through Zod (DTOs)
- No business logic in controllers — controllers only orchestrate, services handle the logic
- Every new route requires Swagger decorators (`@ApiTags`, `@ApiOperation`, etc.)
- Every new feature requires tests (at least unit tests)

## Reporting bugs

Open an issue containing:

- A description of the problem
- Steps to reproduce it
- Expected versus actual behavior
- Node version / environment (Docker or local)

## Suggesting features

Before implementing, open an issue with the `enhancement` label describing the problem the feature solves. This avoids rework if the approach needs to be discussed.

## Code of Conduct

By contributing, you agree to follow the project's [Code of Conduct](CODE_OF_CONDUCT.md).

---
