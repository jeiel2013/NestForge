# NestForge

Monorepo do NestForge: uma **CLI interativa** (`nestforge`) que gera projetos NestJS prontos pra produção a partir de um boilerplate completo — auth, RBAC, banco, filas, observabilidade, testes e documentação já configurados.

```bash
npx nestforge
```

## Estrutura do repositório

```
/
├── packages/
│   └── cli/              → o pacote publicado no npm (nestforge)
└── templates/
    └── prisma/            → o boilerplate NestJS completo (Prisma + TypeScript + PostgreSQL)
```

- **`packages/cli`** — o código-fonte da CLI: prompts interativos, gerador de projeto, entrypoint. É isso que vira o pacote `nestforge` no npm.
- **`templates/prisma`** — o boilerplate em si, um projeto NestJS completo e funcional por conta própria (tem README, ARCHITECTURE.md, ROADMAP.md e docs próprios). A CLI copia esse template pra gerar o projeto do usuário.

## O que a CLI faz

Ao rodar `npx nestforge`, você responde 11 perguntas e recebe um projeto NestJS pronto:

| # | Pergunta | Opções | Status |
|---|---|---|---|
| 1 | Nome do projeto | texto livre | ✅ |
| 2 | Linguagem | TypeScript / JavaScript | ✅ TypeScript e JavaScript |
| 3 | ORM / Query Builder | Prisma / TypeORM / Drizzle / Nenhum | ✅ Prisma · ⏳ demais |
| 4 | Banco de dados | PostgreSQL / MySQL / SQLite / MongoDB | ✅ PostgreSQL, MySQL e SQLite · ⏳ MongoDB |
| 5 | Docker | sim/não | ✅ toggle real |
| 6 | Documentação Swagger/OpenAPI | sim/não | ✅ toggle real |
| 7 | Validação global (Zod) | sim/não | ✅ toggle real |
| 8 | Redis (cache/filas + e-mail) | sim/não | ✅ toggle real |
| 9 | Estratégia de autenticação | JWT / Session-Cookies / OAuth / Nenhuma | ✅ JWT, OAuth e Nenhuma · ⏳ Session-Cookies |
| 10 | Controle de acesso (RBAC/Permissions) | sim/não | ✅ toggle real |
| 11 | Criar `.env` automaticamente | sim/não | ✅ toggle real |

✅ = funciona de verdade hoje · ⏳ = ainda não implementado; a CLI recusa com mensagem clara

A opção JavaScript é gerada pela CLI a partir do template TypeScript, convertido durante a criação do projeto.
Não é necessário mudar a árvore da estrutura que diz templates/prisma → ... TypeScript + PostgreSQL: ela descreve corretamente o template-fonte. A CLI é quem transforma esse template em JavaScript durante a geração.

### O que o template Prisma já traz (quando tudo roda)

- **Autenticação**: JWT (access + refresh token com rotação), OAuth Google e GitHub, forgot/reset password, verificação de e-mail
- **RBAC + Permissions granulares**: roles (Admin/Manager/User) e permissions por ação (`user:create`, `user:delete`, etc.)
- **Usuários**: CRUD completo, paginação e filtros, upload de avatar
- **Banco**: Prisma + PostgreSQL, MySQL ou SQLite., migrations, seed com um usuário por role
- **Filas e e-mail**: BullMQ + Redis, templates de e-mail, Mailpit em dev
- **Segurança**: Helmet, CORS, Rate Limiting, validação com Zod (`nestjs-zod`), serialização de output, CSRF opcional
- **Observabilidade**: logs estruturados (Pino), health checks (`/health`), métricas Prometheus (`/metrics`)
- **Docs**: Swagger com exemplos de request/response, guia de arquitetura, guia de como adicionar um módulo novo
- **Testes**: unitários (Vitest) e e2e (Supertest, banco isolado)
- **Docker & CI**: `docker-compose` com API/Postgres/Redis/Mailpit, GitHub Actions (build/lint/test/e2e)

Detalhes de cada um desses recursos estão documentados dentro do próprio template: [`templates/prisma/README.md`](templates/prisma/README.md) e [`templates/prisma/ARCHITECTURE.md`](templates/prisma/ARCHITECTURE.md).

## Desenvolvendo a CLI localmente

```bash
npm install                # na raiz, instala tudo via workspaces
cd packages/cli
npm run dev                 # roda a CLI direto do TypeScript, sem buildar
```

Testar como se estivesse instalada de verdade:

```bash
npm run build
npm link
nestforge                   # em qualquer pasta
```

Guia completo de teste: ver [`packages/cli/TESTING.md`](packages/cli/TESTING.md).

## Publicando

```bash
cd packages/cli
npm run build       # compila TS + copia templates/ pra dentro do pacote publicado
npm publish
```

## Roadmap da CLI

O que já funciona de verdade vs. o que ainda é placeholder está sempre atualizado em [`packages/cli/README.md`](packages/cli/README.md) — é a fonte de verdade de status, pra não a documentação ficar prometendo algo que o código ainda não faz.

## Licença

MIT — ver [`templates/prisma/LICENSE`](templates/prisma/LICENSE).