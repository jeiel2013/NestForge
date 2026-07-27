# NestForge

> Production-ready NestJS starter with Prisma, Authentication, Docker, Testing, CI/CD and Clean Architecture.

[![CI](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml/badge.svg)](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com)

NestForge é um boilerplate de NestJS pensado para acelerar o início de projetos backend sérios, com autenticação completa, arquitetura limpa, segurança e observabilidade já configuradas. A ideia é você clonar, rodar `docker compose up` e já ter uma API pronta para evoluir.

## ✨ Features

- 🔐 **Autenticação completa** — login, cadastro, logout, refresh token, forgot/reset password, verificação de e-mail
- 🌐 **OAuth** — Google e GitHub
- 👥 **RBAC** — Roles (Admin, Manager, User) e Permissions granulares
- 🛡️ **Segurança** — Helmet, CORS, Rate Limiting, validação e serialização com Zod
- 🗄️ **Banco de dados** — Prisma + PostgreSQL, migrations e seed
- 📨 **E-mails** — filas com BullMQ + Redis, testado localmente com Mailpit
- 📄 **Documentação automática** — Swagger
- 🪵 **Logs estruturados** — Pino
- ✅ **Testes** — unitários e de integração com Vitest
- 🐳 **Docker** — ambiente completo com um comando
- ⚙️ **CI/CD** — GitHub Actions (build, lint, test)

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL |
| Cache / Filas | Redis + BullMQ |
| Autenticação | JWT + Better Auth |
| Validação | Zod |
| Docs | Swagger |
| E-mail (dev) | Mailpit |
| Testes | Vitest |
| CI | GitHub Actions |

## 📁 Estrutura de pastas

```
src/
│
├── auth/          # login, cadastro, JWT, OAuth, guards, strategies
├── users/         # CRUD de usuários
├── common/        # decorators, filters, guards, interceptors, pipes, utils
├── config/        # configuração tipada e validada (env)
├── database/      # PrismaService / PrismaModule
├── modules/       # módulos de domínio adicionais
├── shared/        # código compartilhado entre módulos
├── jobs/          # filas e workers (BullMQ)
├── mail/          # templates e envio de e-mail
└── main.ts
```

## 🚀 Começando

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Rodando com Docker (recomendado)

```bash
git clone https://github.com/jeiel2013/nestforge.git
cd nestforge
cp .env.example .env
docker compose up
```

Isso sobe: API, PostgreSQL, Redis e Mailpit (interface de e-mail em `http://localhost:8025`).

### Rodando localmente

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

A documentação Swagger fica disponível em `http://localhost:3000/docs`.

## 🧪 Testes

```bash
npm run test          # unitários
npm run test:e2e      # integração
npm run test:cov      # cobertura
```

## 🔑 Roles & Permissions

| Role | Descrição |
|---|---|
| `ADMIN` | acesso total ao sistema |
| `MANAGER` | gerencia usuários e relatórios |
| `USER` | acesso padrão |

Permissions são granulares (`user:create`, `user:delete`, `report:read`, etc) e combinadas com roles via decorators (`@Roles()`, `@Permissions()`).

## 🗺️ Roadmap

- [x] Autenticação (login, cadastro, JWT)
- [x] Refresh Token
- [x] Docker
- [x] CI (build, lint, test)
- [x] OAuth (Google/GitHub)
- [ ] Upload de arquivos
- [ ] Filas (BullMQ)
- [ ] E-mails transacionais
- [ ] RBAC completo (permissions granulares)
- [ ] Testes de integração completos
- [ ] Documentação completa (Swagger + guia de arquitetura)

Veja o [ROADMAP.md](ROADMAP.md) detalhado.

### Configurando o login social (OAuth)

Para habilitar login via Google e GitHub, crie um OAuth App em cada provedor e preencha no `.env`:

\`\`\`bash
APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
\`\`\`

- **Google**: crie as credenciais no [Google Cloud Console](https://console.cloud.google.com/apis/credentials) e configure a URL de callback como `{APP_URL}/auth/google/callback`.
- **GitHub**: crie um OAuth App em `Settings > Developer settings > OAuth Apps` e configure a mesma URL de callback, trocando para `{APP_URL}/auth/github/callback`.

Depois é só acessar `GET /auth/google` ou `GET /auth/github` que o fluxo de redirecionamento cuida do resto — o callback já devolve `accessToken` e `refreshToken` como no login tradicional. Se for a primeira vez do usuário, uma conta é criada automaticamente e vinculada ao provedor.

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para o guia completo.

## 📄 Licença

Este projeto está sob a licença MIT — veja [LICENSE](LICENSE).

---

Feito por [Jeiel Alves](https://github.com/jeiel2013) · [jeieldev.vercel.app](https://jeieldev.com.br)
