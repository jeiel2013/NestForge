# NestForge

> Production-ready NestJS starter with TypeORM, Authentication, Docker, Testing, CI/CD and Clean Architecture.

[![CI](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml/badge.svg)](https://github.com/jeiel2013/nestforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com)

NestForge é um boilerplate de NestJS pensado para acelerar o início de projetos backend sérios, com autenticação completa, arquitetura limpa, segurança e observabilidade já configuradas. A ideia é você clonar, rodar `docker compose up` e já ter uma API pronta para evoluir.

## ✨ Features

- 🔐 **Autenticação configurável** — JWT com access/refresh token, Session/Cookies persistida no TypeORM, OAuth-only ou nenhuma autenticação
- 🌐 **OAuth** — Google e GitHub, integrado à estratégia de token ou sessão escolhida
- 👥 **RBAC** — Roles (Admin, Manager, User) e Permissions granulares
- 🛡️ **Segurança** — Helmet, CORS, Rate Limiting, validação e serialização com Zod
- 🗄️ **Banco de dados** — TypeORM com PostgreSQL, MySQL ou SQLite
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
| ORM | TypeORM |
| Banco | PostgreSQL, MySQL ou SQLite |
| Cache / Filas | Redis + BullMQ |
| Autenticação | JWT, Session/Cookies ou OAuth com Passport |
| Validação | Zod + nestjs-zod (schemas viram DTO + Swagger automaticamente) |
| Docs | Swagger |
| E-mail (dev) | Mailpit |
| Testes | Vitest |
| CI | GitHub Actions |

## 📁 Estrutura de pastas

```
src/
│
├── auth/          # login, sessões/tokens, OAuth, guards e strategies
├── users/         # CRUD de usuários
├── common/        # decorators, filters, guards, interceptors, pipes, utils
├── config/        # configuração tipada e validada (env)
├── database/      # DataSource, configuração, migrations e seed
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
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run seed
npm run start:dev
```

A documentação Swagger fica disponível em `http://localhost:3000/docs`.

## 🔑 Roles & Permissions

| Role | Descrição |
|---|---|
| `ADMIN` | acesso total ao sistema |
| `MANAGER` | gerencia usuários e relatórios |
| `USER` | acesso padrão |

Permissions são granulares (`user:create`, `user:delete`, `report:read`, etc) e combinadas com roles via decorators (`@Roles()`, `@Permissions()`).

## 🗺️ Roadmap

- [x] Autenticação por JWT
- [x] Autenticação por Session/Cookies
- [x] OAuth Google/GitHub
- [x] Estratégia OAuth-only
- [x] Geração sem autenticação
- [x] Refresh Token
- [x] Docker
- [x] CI (build, lint, test)
- [x] OAuth (Google/GitHub)
- [x] Upload de arquivos
- [x] Filas (BullMQ)
- [x] E-mails transacionais
- [x] RBAC completo (permissions granulares)
- [x] Testes de integração completos
- [x] Documentação completa (Swagger + guia de arquitetura)

Veja o [ROADMAP.md](ROADMAP.md) detalhado.

### Configurando o login social (OAuth)

Para habilitar login via Google e GitHub, crie um OAuth App em cada provedor e preencha no `.env`:

```bash
APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- **Google**: crie as credenciais no [Google Cloud Console](https://console.cloud.google.com/apis/credentials) e configure a URL de callback como `{APP_URL}/auth/google/callback`.
- **GitHub**: crie um OAuth App em `Settings > Developer settings > OAuth Apps` e configure a mesma URL de callback, trocando para `{APP_URL}/auth/github/callback`.

Depois é só acessar `GET /auth/google` ou `GET /auth/github`. No callback, a API emite access/refresh tokens ou estabelece uma sessão por cookie, conforme a estratégia escolhida. Se for o primeiro acesso, uma conta é criada e vinculada ao provedor.

### Autenticação por Session/Cookies

Quando o projeto é gerado com Session/Cookies, cadastro e login criam uma sessão persistida no banco por `connect-typeorm`. O identificador é enviado no cookie `nestforge.sid`, configurado com `httpOnly`, `sameSite=lax` e `secure` em produção.

Configure no `.env`:

```bash
SESSION_SECRET=use-um-segredo-com-pelo-menos-32-caracteres
SESSION_MAX_AGE=604800000
```

### Recuperação de senha e verificação de e-mail

Todo cadastro (`POST /auth/register`) já dispara um e-mail de verificação automaticamente. Os e-mails são enfileirados com BullMQ/Redis e processados por um worker que envia via SMTP — em desenvolvimento, tudo cai no Mailpit (`http://localhost:8025`), então nada sai pra internet de verdade.

| Rota | O que faz |
|---|---|
| `POST /auth/forgot-password` | Recebe um `email` e enfileira o envio do link de redefinição (resposta sempre genérica, não revela se o e-mail existe) |
| `POST /auth/reset-password` | Recebe `token` + `password` e troca a senha; também revoga os refresh tokens ativos do usuário |
| `GET /auth/verify-email?token=...` | Confirma o e-mail a partir do link recebido |

Os tokens de reset e verificação expiram em 1 hora e 24 horas, respectivamente, e são de uso único.

## 🔑 Roles & Permissions

| Role | Descrição |
|---|---|
| `ADMIN` | acesso total ao sistema |
| `MANAGER` | gerencia usuários e relatórios |
| `USER` | acesso padrão |

Cada role tem um conjunto fixo de permissões, mapeado em `src/common/constants/role-permissions.ts`:

| Permission | ADMIN | MANAGER | USER |
|---|:---:|:---:|:---:|
| `user:create` | ✅ | ❌ | ❌ |
| `user:read` | ✅ | ✅ | ✅ |
| `user:update` | ✅ | ✅ | ❌ |
| `user:delete` | ✅ | ❌ | ❌ |
| `report:read` | ✅ | ✅ | ❌ |

Nas rotas, use `@Permissions(Permission.UserCreate)` para exigir uma permissão específica, ou `@Roles(Role.ADMIN)` quando o controle por cargo já for suficiente. Os dois guards (`RolesGuard` e `PermissionsGuard`) rodam globalmente e só bloqueiam a rota se ela tiver o decorator correspondente.

## 👥 Usuários: paginação, filtros e avatar

`GET /users` aceita query params pra paginar e filtrar a listagem:

```bash
GET /users?page=2&limit=20&search=jeiel&role=ADMIN
```

| Parâmetro | Descrição |
|---|---|
| `page` | página atual (padrão: 1) |
| `limit` | itens por página, até 100 (padrão: 10) |
| `search` | busca por nome ou e-mail (case-insensitive) |
| `role` | filtra por `ADMIN`, `MANAGER` ou `USER` |

A resposta vem no formato `{ data, meta: { total, page, limit, totalPages } }`.

Pra trocar o avatar do usuário autenticado:

```bash
curl -X POST http://localhost:3000/users/me/avatar \
  -H "Authorization: Bearer <accessToken>" \
  -F "file=@/caminho/da/foto.png"
```

Aceita PNG, JPEG e WEBP até 2MB; o arquivo fica salvo em `./uploads/avatars` e é servido em `/uploads/avatars/<arquivo>`.

## 🛡️ Segurança: serialização e CSRF

Toda validação de entrada (`body`, `query`) usa **Zod** via [`nestjs-zod`](https://github.com/BenLorantfy/nestjs-zod): cada DTO é um `z.object({...})` transformado em classe com `createZodDto(schema)`, validado globalmente pelo `ZodValidationPipe`. O `patchNestJsSwagger()` no bootstrap ensina o Swagger a ler esses schemas automaticamente — não precisa duplicar validação (Zod) e documentação (`@ApiProperty`) como no `class-validator`. Os schemas exportados (ex.: `createUserSchema`) também podem ser reaproveitados/combinados (como o `updateUserSchema`, que é só um `createUserSchema.partial()`).

- 🪵 **Observabilidade** — logs estruturados com Pino, health checks (`/health`) e métricas Prometheus (`/metrics`)

O seed cria três contas de teste, uma por role:

| E-mail | Senha | Role |
|---|---|---|
| `admin@nestforge.dev` | `admin123` | ADMIN |
| `manager@nestforge.dev` | `manager123` | MANAGER |
| `user@nestforge.dev` | `user1234` | USER |

## 📈 Observabilidade

`GET /health` retorna o status agregado da API — banco (TypeORM), Redis, memória (heap/RSS) e espaço em disco — usando `@nestjs/terminus`. Cada verificação aparece individualmente na resposta, então dá pra saber exatamente o que caiu.

`GET /metrics` expõe métricas no formato do Prometheus (via `prom-client`): as métricas padrão de Node.js (CPU, memória, event loop) mais `http_request_duration_seconds` (histograma) e `http_requests_total` (contador), ambas com labels de `method`, `route` e `status_code`. Basta apontar um scrape job do Prometheus pra essa rota.

## 🧪 Testes

```bash
npm run test          # unitários
npm run test:e2e      # integração (e2e)
npm run test:cov      # cobertura
```

Os testes e2e (`test/*.e2e-spec.ts`) sobem a aplicação real (Nest + TypeORM + Redis) e batem nos endpoints com `supertest`, usando um banco isolado (`.env.test`, banco `nestforge_test` — nunca o de desenvolvimento). Antes de rodar pela primeira vez:

```bash
createdb nestforge_test   # ou: psql -U nestforge -c "CREATE DATABASE nestforge_test;"
docker compose up -d postgres redis
npm run test:e2e
```

O script `pretest:e2e` já aplica as migrations nesse banco automaticamente antes de cada rodada. Cada teste limpa as tabelas antes de rodar (`test/utils/clean-database.ts`), então não precisa zerar nada manualmente entre execuções. Hoje cobrem o fluxo de autenticação completo (registro, login, refresh, logout, e-mail duplicado, credenciais inválidas) e o CRUD de usuários com RBAC (ADMIN consegue tudo, USER lê mas não cria, `/users/me`, acesso sem token).

Os testes unitários (`src/**/*.spec.ts`) rodam isolados, com os repositories do TypeORM e o `ioredis` mockados (`vi.fn()` / `vi.mock()`) — não precisam de banco nem Redis de verdade. Hoje cobrem: `AuthService` (registro/login), `UsersService` (CRUD completo + paginação + confirmação de que o `passwordHash` não vaza na serialização via `instanceToPlain`), `RolesGuard`, `PermissionsGuard` e os indicadores de saúde (`TypeOrmHealthIndicator`, `RedisHealthIndicator`).

## 📚 Documentação adicional

- [ARCHITECTURE.md](ARCHITECTURE.md) — como o projeto é organizado e por que certas decisões de design foram tomadas (Zod vs. class-validator, permissions em código vs. banco, BullMQ, etc.)
- [docs/adding-a-module.md](docs/adding-a-module.md) — passo a passo pra adicionar um recurso novo seguindo as convenções do projeto

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para o guia completo.

## 📄 Licença

Este projeto está sob a licença MIT — veja [LICENSE](LICENSE).

---

Feito por [Jeiel Alves](https://github.com/jeiel2013) · [jeieldev.com.br](https://jeieldev.com.br)
