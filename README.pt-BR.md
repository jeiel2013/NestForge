# NestForge

[English](README.md) | **Português**

Monorepo do NestForge: uma CLI interativa que gera projetos NestJS prontos para produção com autenticação, autorização, banco de dados, filas, observabilidade, testes e documentação.

```bash
npx nestforge
```

## Estrutura do repositório

```text
/
├── packages/
│   └── cli/       → pacote `nestforge` publicado no npm
└── templates/
    ├── prisma/    → template NestJS com Prisma
    ├── typeorm/   → template NestJS com TypeORM
    └── drizzle/  → template NestJS com Drizzle ORM
```

* `packages/cli` — código-fonte da CLI, incluindo prompts, gerador, transformações e
  testes automatizados.
* `templates/prisma` — projeto NestJS completo usando Prisma.
* `templates/typeorm` — projeto NestJS completo usando TypeORM e repositories.
* `templates/drizzle` — projeto NestJS completo usando Drizzle ORM.

Durante o build, os templates são copiados para dentro do pacote da CLI para que ele funcione depois de publicado no npm.

## O que a CLI faz

Ao executar `npx nestforge`, você responde às perguntas do fluxo interativo e recebe um projeto NestJS configurado conforme suas escolhas.

## O que a CLI configura

1. **Nome do projeto** — texto livre — ✅ Disponível
2. **Linguagem** — TypeScript ou JavaScript — ✅ Ambas disponíveis
3. **ORM / Query Builder** — Prisma, TypeORM ou Drizzle — ✅ Disponíveis
4. **ORM / Query Builder** — Nenhum — ⏳ Ainda não implementado
5. **Banco de dados** — PostgreSQL, MySQL ou SQLite — ✅ Disponíveis
6. **Banco de dados** — MongoDB — ⏳ Ainda não implementado
7. **Docker** — sim ou não — ✅ Toggle real
8. **Swagger/OpenAPI** — sim ou não — ✅ Toggle real
9. **Validação global com Zod** — sim ou não — ✅ Toggle real
10. **Redis, filas e e-mail** — sim ou não — ✅ Toggle real
11. **Autenticação** — JWT, Session/Cookies, OAuth-only ou Nenhuma — ✅ Todas disponíveis
12. **RBAC e Permissions** — sim ou não — ✅ Toggle real
13. **Criação do `.env`** — sim ou não — ✅ Toggle real

Legenda:

* ✅ Funciona atualmente.
* ⏳ Ainda não está implementado; a CLI recusa a opção com uma mensagem clara.

A opção JavaScript é gerada automaticamente a partir dos templates TypeScript durante a criação do projeto.

## ORMs disponíveis

### Prisma

O template Prisma inclui:

* Prisma Client;
* schema declarativo;
* migrations;
* seed;
* PostgreSQL, MySQL e SQLite;
* store Prisma para Session/Cookies;
* health check baseado em Prisma.

### TypeORM

O template TypeORM inclui:

* entidades com decorators;
* repositories injetados com `TypeOrmModule.forFeature`;
* `DataSource` configurado por banco;
* migrations;
* seed;
* PostgreSQL com `pg`;
* MySQL com `mysql2`;
* SQLite com `better-sqlite3`;
* store persistente com `connect-typeorm`;
* health check baseado em `DataSource`.

### Drizzle ORM

O template Drizzle inclui:

* schemas tipados por banco;
* query builder tipado;
* configuração com Drizzle Kit;
* migrations SQL;
* seed;
* PostgreSQL com `pg`;
* MySQL com `mysql2`;
* SQLite com `better-sqlite3`;
* `DrizzleSessionStore` para Session/Cookies;
* health check usando o driver nativo selecionado;
* transações adaptadas ao comportamento do SQLite.

A CLI mantém somente o template, o schema e o driver necessários para o ORM e o banco selecionados.

## Recursos dos templates

### Autenticação

As estratégias disponíveis são:

* JWT com access e refresh tokens;
* Session/Cookies persistida no banco;
* OAuth Google e GitHub;
* OAuth-only;
* nenhuma autenticação.

A estratégia JWT inclui:

* rotação de refresh token;
* refresh tokens únicos;
* revogação;
* logout;
* recuperação de senha;
* verificação de e-mail, quando Redis e e-mail estão habilitados.

A estratégia Session/Cookies inclui:

* cookie `httpOnly`;
* regeneração de sessão;
* persistência no banco;
* `SessionAuthGuard`;
* proteção CSRF com token associado à sessão;
* logout com destruição da sessão.

Na opção “Nenhuma”, os diretórios `src/auth` e `src/users` são removidos.

### RBAC e Permissions

Os templates incluem:

* roles `ADMIN`, `MANAGER` e `USER`;
* permissions granulares;
* `RolesGuard`;
* `PermissionsGuard`;
* decorators para proteger endpoints.

### Usuários

* CRUD;
* paginação;
* filtros;
* busca;
* upload de avatar;
* serialização segura;
* remoção do `passwordHash` das respostas.

### Redis, filas e e-mail

Quando habilitado:

* Redis;
* BullMQ;
* filas de e-mail;
* Nodemailer;
* Mailpit em desenvolvimento;
* recuperação de senha;
* verificação de e-mail;
* health check do Redis.

Quando desabilitado, arquivos e dependências relacionados são removidos.

### Segurança

* Helmet;
* CORS configurável;
* rate limiting;
* Zod;
* serialização com `ClassSerializerInterceptor`;
* hash de senhas com bcrypt;
* hash de refresh tokens;
* proteção CSRF para Session/Cookies;
* cookies seguros em produção;
* validação das variáveis de ambiente.

### Observabilidade

* logs estruturados com Pino;
* health check em `/health`;
* métricas Prometheus em `/metrics`;
* indicadores de banco, Redis, memória e disco.

### Testes

* testes unitários com Vitest;
* testes E2E com Supertest;
* banco de teste isolado;
* helpers para inicializar a aplicação;
* limpeza de tabelas entre testes;
* testes específicos de JWT e Session/Cookies;
* testes de CSRF;
* testes de RBAC;
* testes dos health checks.

### Docker e CI

* Dockerfile multi-stage;
* Docker Compose;
* PostgreSQL ou MySQL conforme a escolha;
* SQLite sem serviço externo;
* Redis e Mailpit quando aplicáveis;
* GitHub Actions;
* geração e aplicação de migrations;
* build, lint, testes unitários e E2E.

## Validação atual

As seguintes combinações TypeORM foram validadas com smoke tests completos:

* TypeScript + TypeORM + SQLite + JWT;
* TypeScript + TypeORM + SQLite + Session/Cookies.

As seguintes combinações Drizzle foram validadas com smoke tests completos:

* TypeScript + Drizzle + SQLite + JWT;
* TypeScript + Drizzle + SQLite + Session/Cookies.

Os smoke tests executaram inicialmente:

```bash
npm install
npm run build
npm test
```

Para TypeORM, também foram executados:

```bash
npm run migration:generate
npm run migration:run
npm run seed
npm run test:e2e
```

Para Drizzle, também foram executados:

```bash
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run test:e2e
```

Os testes automatizados do gerador também cobrem:

* PostgreSQL;
* MySQL;
* SQLite;
* Prisma;
* TypeORM;
* Drizzle;
* TypeScript;
* JavaScript;
* JWT;
* OAuth-only;
* Session/Cookies;
* projetos sem autenticação;
* remoção de recursos opcionais;
* recusa de opções ainda não implementadas.

PostgreSQL e MySQL possuem cobertura automatizada de geração, configuração de schema e remoção dos drivers não utilizados. Smoke tests reais desses bancos ainda exigem os serviços locais ou Docker.

## Documentação dos templates

### Prisma

* [README do template Prisma](templates/prisma/README.md)
* [Arquitetura do template Prisma](templates/prisma/ARCHITECTURE.md)
* [Documentação do template Prisma](templates/prisma/docs)

### TypeORM

* [README do template TypeORM](templates/typeorm/README.md)
* [Arquitetura do template TypeORM](templates/typeorm/ARCHITECTURE.md)
* [Documentação do template TypeORM](templates/typeorm/docs)

### Drizzle

* [README do template Drizzle](templates/drizzle/README.md)
* [Arquitetura do template Drizzle](templates/drizzle/ARCHITECTURE.md)
* [Roadmap do template Drizzle](templates/drizzle/ROADMAP.md)
* [Documentação do template Drizzle](templates/drizzle/docs)

## Desenvolvimento local

Na raiz do monorepo:

```bash
npm install
cd packages/cli
npm run dev
```

Para executar os testes automatizados da CLI:

```bash
npm test
```

Para testar como uma CLI instalada:

```bash
npm run build
npm link
nestforge
```

O guia completo está em [TESTING](packages/cli/TESTING.md).

## Publicação

```bash
cd packages/cli
npm run build
npm pack --dry-run
npm publish
```

O build compila a CLI e copia os templates Prisma, TypeORM e Drizzle para o pacote publicado.

## Roadmap

Próximos itens planejados:

* opção sem ORM;
* MongoDB;
* validação completa do nome do pacote;
* ampliação da matriz de smoke tests com bancos executados em serviços reais;
* exemplos de deploy automatizado.

O status detalhado fica no [README da CLI](packages/cli/README.md).

## Licença

MIT — consulte:

* [Licença do template Prisma](templates/prisma/LICENSE)
* [Licença do template TypeORM](templates/typeorm/LICENSE)
* [Licença do template Drizzle](templates/drizzle/LICENSE)
