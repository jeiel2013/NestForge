# nestforge

CLI interativa que gera um projeto NestJS a partir do boilerplate [NestForge](../../templates/prisma).

```bash
npx nestforge
```

## O que já funciona (v0.1.0)

- Prompts interativos (nome do projeto, linguagem, ORM, banco de dados, recursos adicionais) via `@clack/prompts`
- Template **Prisma + TypeScript + PostgreSQL** completo — é o boilerplate inteiro que já existe em `templates/prisma`: auth (JWT + OAuth Google/GitHub), RBAC + Permissions granulares, forgot/reset password, verificação de e-mail, upload de avatar, paginação/filtros, health checks, métricas Prometheus, testes unitários e e2e
- Toggle real do recurso **Docker**: se você desmarcar, o `Dockerfile` e o `docker-compose.yml` simplesmente não vão pro projeto gerado

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
| Recurso: Swagger | ⚠️ sempre incluído (não dá pra desligar ainda) |
| Recurso: JWT | ⚠️ sempre incluído (não dá pra desligar ainda) |
| Recurso: Redis | ⚠️ sempre incluído (não dá pra desligar ainda) |

Desligar de verdade `swagger`/`jwt`/`redis` exige remover módulos, rotas, imports e dependências interligadas no template — é um trabalho de "template engine" mais sério que copiar/apagar arquivo, e é o próximo passo natural do gerador (`packages/cli/src/generator.ts`).

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