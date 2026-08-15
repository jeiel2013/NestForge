# nestforge

CLI interativa que gera um projeto NestJS a partir do boilerplate [NestForge](../../templates/prisma).

```bash
npx nestforge
```

Guia de teste passo a passo (todas as perguntas, na ordem, com checklist): ver [`TESTING.md`](TESTING.md).

## O que já funciona (v0.1.0)

- Prompts interativos (nome do projeto, linguagem, ORM, banco de dados, recursos adicionais, estratégia de autenticação, controle de acesso, criação do `.env`) via `@clack/prompts`
- Template **Prisma + TypeScript + PostgreSQL + JWT** completo — é o boilerplate inteiro que já existe em `templates/prisma`: auth (JWT + OAuth Google/GitHub), RBAC + Permissions granulares, forgot/reset password, verificação de e-mail, upload de avatar, paginação/filtros, health checks, métricas Prometheus, testes unitários e e2e
- Toggle real do recurso **Docker**: se você desmarcar, o `Dockerfile` e o `docker-compose.yml` simplesmente não vão pro projeto gerado
- Toggle real do recurso **Validação global (Zod)**: se você desmarcar, o `ZodValidationPipe` não é registrado no `main.ts` nem no setup de testes e2e (os DTOs continuam existindo como classes, só não são mais validados automaticamente)
- Toggle real do recurso **Redis**: se você desmarcar, some o módulo `mail/` inteiro, o `BullModule`, o `RedisHealthIndicator` e as rotas de forgot/reset password + verificação de e-mail (elas dependem de mandar e-mail, que depende da fila) — `register`/`login` continuam funcionando normalmente
- Criação automática do **`.env`** a partir do `.env.example`, se você pedir

> A pergunta "Deseja incluir documentação Swagger/OpenAPI?" cobre tanto o Swagger quanto a "documentação de API" — é a mesma coisa no template atual, não tem pergunta duplicada.

## O que ainda é placeholder

| Escolha | Status |
|---|---|
| Linguagem: JavaScript | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: TypeORM | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: Drizzle | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: Nenhum | ❌ não implementado |
| Banco: MySQL | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Banco: SQLite | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Banco: MongoDB | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Auth: Session/Cookies | ❌ não implementado — a CLI recusa com uma mensagem clara |
| Auth: OAuth apenas (sem JWT) | ❌ não implementado — hoje OAuth só existe junto do JWT |
| Auth: Nenhuma | ❌ não implementado — ainda não existe variante do template sem auth |
| Recurso: Swagger / documentação de API | ⚠️ sempre incluído (não dá pra desligar ainda) |
| Controle de acesso (RBAC/Permissions) | ⚠️ sempre incluído junto do JWT (a resposta é guardada mas ainda não desliga nada) |

Desligar de verdade `swagger`/RBAC ainda exige remover módulos, rotas, imports e dependências interligadas no template — é o próximo passo natural do gerador (`packages/cli/src/generator.ts`).

**Limitação conhecida do toggle de Redis**: o `docker-compose.yml` e o `.env`/`.env.example` continuam trazendo o serviço/variáveis do Redis mesmo com o recurso desligado (clutter inofensivo, não quebra nada, mas não está 100% limpo ainda).

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