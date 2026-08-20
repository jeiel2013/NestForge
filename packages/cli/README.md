# nestforge

CLI interativa que gera um projeto NestJS a partir do boilerplate [NestForge](../../templates/prisma).

```bash
npx nestforge
```

Guia de teste passo a passo (todas as perguntas, na ordem, com checklist): ver [`TESTING.md`](TESTING.md).

## O que já funciona (v0.1.0)

- Prompts interativos (nome do projeto, linguagem, ORM, banco de dados, recursos adicionais, estratégia de autenticação, controle de acesso, criação do `.env`) via `@clack/prompts`
- Template **Prisma + TypeScript + JWT** completo, com **PostgreSQL, MySQL ou SQLite** à escolha — é o boilerplate inteiro que já existe em `templates/prisma`: auth (JWT + OAuth Google/GitHub), RBAC + Permissions granulares, forgot/reset password, verificação de e-mail, upload de avatar, paginação/filtros, health checks, métricas Prometheus, testes unitários e e2e
- Toggle real do recurso **Docker**: se você desmarcar, o `Dockerfile` e o `docker-compose.yml` simplesmente não vão pro projeto gerado
- Toggle real do recurso **Validação global (Zod)**: se você desmarcar, o `ZodValidationPipe` não é registrado no `main.ts` nem no setup de testes e2e (os DTOs continuam existindo como classes, só não são mais validados automaticamente)
- Toggle real do recurso **Redis**: se você desmarcar, some o módulo `mail/` inteiro, o `BullModule`, o `RedisHealthIndicator` e as rotas de forgot/reset password + verificação de e-mail (elas dependem de mandar e-mail, que depende da fila) — `register`/`login` continuam funcionando normalmente
- Toggle real do **controle de acesso (RBAC/Permissions)**: se você desmarcar, somem os guards, decorators e constants de RBAC, e as rotas de usuários deixam de exigir uma permission específica (continuam exigindo login, só não checam mais o que aquele usuário pode fazer)
- Toggle real do recurso **Swagger / documentação de API**: se você desmarcar, some o bootstrap do Swagger no `main.ts` (`/docs` deixa de existir) e todos os decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.) somem de todos os controllers
- **MySQL e SQLite** funcionam de verdade além do PostgreSQL: o `provider` do `schema.prisma`, a `DATABASE_URL` (`.env.example`/`.env.test`), o serviço no `docker-compose.yml` e o job do CI se ajustam automaticamente ao banco escolhido
- Estratégia de autenticação **"Nenhuma"** funciona de verdade: `src/auth/` e `src/users/` inteiros somem do projeto gerado (módulos, guards, DTOs, testes e2e — tudo), sobrando só o core (health, métricas, etc.)
- Criação automática do **`.env`** a partir do `.env.example`, se você pedir

> A pergunta "Deseja incluir documentação Swagger/OpenAPI?" cobre tanto o Swagger quanto a "documentação de API" — é a mesma coisa no template atual, não tem pergunta duplicada.

## O que ainda é placeholder

| Escolha | Status |
|---|---|
| Linguagem: JavaScript | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: TypeORM | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: Drizzle | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: Nenhum | ❌ não implementado |
| Banco: MongoDB | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Auth: Session/Cookies | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Auth: OAuth apenas (sem JWT) | ❌ não implementado — hoje OAuth só existe junto do JWT |

O que falta agora é abrir mais ORMs/bancos/estratégias de auth — os toggles de recurso (a parte que essa leva de commits fechou) estão todos funcionando.

Desligar de verdade `swagger` ainda exige remover decorators espalhados em praticamente todo controller — é o próximo (e último, dos toggles planejados) passo natural do gerador (`packages/cli/src/generator.ts`).

**Limitação conhecida do toggle de Redis**: o `docker-compose.yml` e o `.env`/`.env.example` continuam trazendo o serviço/variáveis do Redis mesmo com o recurso desligado (clutter inofensivo, não quebra nada, mas não está 100% limpo ainda).
**Limitação conhecida da estratégia "Nenhuma"**: o `schema.prisma` continua com os models `User`, `RefreshToken`, `OAuthAccount`, etc. mesmo sem nenhum código usando eles (clutter inofensivo — o projeto compila e roda normal, só sobra tabela sem uso se você rodar as migrations). O `prisma/seed.ts` também continua tentando criar usuários de teste.

**Todos os 6 recursos opcionais planejados (Docker, Validação global, Redis, RBAC, Swagger, `.env`) agora têm toggle real.**

## Desenvolvimento local

```bash
# na raiz do monorepo
npm install
cd packages/cli
npm run dev        # roda a CLI direto do TypeScript (tsx), sem buildar
```

Pra testar como se fosse instalada de verdade:

```bash
npm run build
npm link
nestforge   # em qualquer pasta
```

## Publicando

```bash
cd packages/cli
npm run build       # compila + copia templates/ pra dentro do pacote
npm publish
```