# nestforge

CLI interativa que gera projetos NestJS a partir dos templates [Prisma](../../templates/prisma) e [TypeORM](../../templates/typeorm) do NestForge.

```bash
npx nestforge
```

Guia de teste passo a passo (todas as perguntas, na ordem, com checklist): ver [`TESTING.md`](TESTING.md).

## O que já funciona (v0.1.0)

- Prompts interativos (nome do projeto, linguagem, ORM, banco de dados, recursos adicionais, estratégia de autenticação, controle de acesso, criação do `.env`) via `@clack/prompts`
- Geração em **TypeScript ou JavaScript** com **Prisma ou TypeORM**, PostgreSQL, MySQL ou SQLite e autenticação por **JWT, Session/Cookies, OAuth-only ou nenhuma** — os templates incluem RBAC + Permissions, upload de avatar, paginação, health checks, métricas, testes unitários e E2E
- Estratégia de autenticação **"OAuth apenas"** funciona de verdade: `register`/`login`/`forgot-password`/`reset-password`/`verify-email` somem (não fazem sentido sem senha), mas OAuth Google/GitHub, `refresh`/`logout` e a validação do access token continuam normalmente
- Estratégia de autenticação **"Session/Cookies"** funciona de verdade: cadastro e login criam uma sessão persistida no banco pelo ORM selecionado, o cliente recebe um cookie `httpOnly`, as rotas protegidas usam `SessionAuthGuard`, o logout destrói a sessão e os callbacks OAuth também iniciam uma sessão; arquivos, dependências e variáveis exclusivos de JWT são removidos; Prisma usa `@quixo3/prisma-session-store` e TypeORM usa `connect-typeorm`
- Toggle real do recurso **Docker**: se você desmarcar, o `Dockerfile` e o `docker-compose.yml` simplesmente não vão pro projeto gerado
- Toggle real do recurso **Validação global (Zod)**: se você desmarcar, o `ZodValidationPipe` não é registrado no `main.ts` nem no setup de testes e2e (os DTOs continuam existindo como classes, só não são mais validados automaticamente)
- Toggle real do recurso **Redis**: se você desmarcar, some o módulo `mail/` inteiro, o `BullModule`, o `RedisHealthIndicator` e as rotas de forgot/reset password + verificação de e-mail (elas dependem de mandar e-mail, que depende da fila) — `register`/`login` continuam funcionando normalmente
- Toggle real do **controle de acesso (RBAC/Permissions)**: se você desmarcar, somem os guards, decorators e constants de RBAC, e as rotas de usuários deixam de exigir uma permission específica (continuam exigindo login, só não checam mais o que aquele usuário pode fazer)
- Toggle real do recurso **Swagger / documentação de API**: se você desmarcar, some o bootstrap do Swagger no `main.ts` (`/docs` deixa de existir) e todos os decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.) somem de todos os controllers
- **PostgreSQL, MySQL e SQLite** funcionam com Prisma e TypeORM: no Prisma, a CLI ajusta o provider do `schema.prisma`; no TypeORM, ajusta `DB_TYPE`, `DATABASE_URL`, tipos das colunas e mantém somente o driver necessário (`pg`, `mysql2` ou `better-sqlite3`)
- Estratégia de autenticação **"Nenhuma"** funciona de verdade: `src/auth/` e `src/users/` inteiros somem do projeto gerado (módulos, guards, DTOs, testes e2e — tudo), sobrando só o core (health, métricas, etc.)
- Criação automática do **`.env`** a partir do `.env.example`, se você pedir
- O template **TypeORM** inclui repositories injetados com `TypeOrmModule.forFeature`, migrations, seed, store persistente de sessões, health check próprio e testes unitários/E2E. As combinações TypeORM + SQLite + JWT e TypeORM + SQLite + Session/Cookies foram validadas com smoke tests completos

> A pergunta "Deseja incluir documentação Swagger/OpenAPI?" cobre tanto o Swagger quanto a "documentação de API" — é a mesma coisa no template atual, não tem pergunta duplicada.

## O que ainda é placeholder

| Escolha | Status |
|---|---|
| ORM: TypeORM | ✅ implementado |
| ORM: Drizzle | ❌ não implementado — a CLI recusa com uma mensagem clara |
| ORM: Nenhum | ❌ não implementado |
| Banco: MongoDB | ❌ não implementado — a CLI recusa com uma mensagem clara |

Os próximos itens planejados são Drizzle ORM, uma opção sem ORM e MongoDB. — as linguagens, estratégias de autenticação e os toggles de recurso disponíveis estão funcionando.

**Limitação conhecida do toggle de Redis**: o `docker-compose.yml` e o `.env`/`.env.example` continuam trazendo o serviço/variáveis do Redis mesmo com o recurso desligado (clutter inofensivo, não quebra nada, mas não está 100% limpo ainda).
**Limitação conhecida da estratégia "Nenhuma" no template Prisma**: o `schema.prisma` continua com os models `User`, `RefreshToken`, `OAuthAccount`, etc. mesmo sem nenhum código usando eles (clutter inofensivo — o projeto compila e roda normal, só sobra tabela sem uso se você rodar as migrations). O `prisma/seed.ts` também continua tentando criar usuários de teste.
**Limitação conhecida da estratégia "OAuth apenas"**: o endpoint `POST /users` (admin criar usuário manualmente com e-mail+senha) continua existindo — a CLI não distingue "estratégia de login" de "como o admin cadastra alguém pelo painel". Se você não quer nem isso, precisa remover essa rota manualmente por enquanto.

**Todos os 6 recursos opcionais planejados (Docker, Validação global, Redis, RBAC, Swagger, `.env`) agora têm toggle real.**

## Desenvolvimento local

```bash
# na raiz do monorepo
npm install
cd packages/cli
npm run dev        # roda a CLI direto do TypeScript (tsx), sem buildar
npm test           # testa automaticamente as combinações geradas pela CLI
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