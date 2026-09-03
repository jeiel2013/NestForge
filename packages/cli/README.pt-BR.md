# nestforge

[English](README.md) | **Português**

CLI interativa que gera projetos NestJS a partir dos templates `../../templates/prisma`, `../../templates/typeorm` e `../../templates/drizzle` do NestForge.

Instale o pacote localmente:

```bash
npm install nestforge-generator
```

Execute a CLI instalada localmente:

```bash
npx nestforge
```

Para o guia de testes, perguntas da CLI e checklist completo, consulte [`TESTING.pt-BR.md`](TESTING.pt-BR.md).

## O que já funciona

* Prompts interativos usando @clack/prompts;
* geração em TypeScript ou JavaScript;
* Prisma, TypeORM e Drizzle ORM;
* PostgreSQL, MySQL e SQLite;
* autenticação JWT, Session/Cookies, OAuth-only ou nenhuma;
* Docker opcional;
* Swagger/OpenAPI opcional;
* validação global com Zod opcional;
* Redis, filas e e-mail opcionais;
* RBAC e Permissions opcionais;
* criação opcional do .env;
* testes automatizados das combinações geradas.

Os projetos incluem recursos como upload de avatar, paginação, filtros, health checks, métricas, testes unitários e testes E2E.

## Linguagens

A CLI gera projetos em:

* TypeScript;
* JavaScript.

A opção JavaScript é produzida automaticamente a partir dos templates TypeScript durante a geração.

A transformação:

* transpila arquivos .ts;
* remove arquivos TypeScript que não devem permanecer;
* atualiza scripts do package.json;
* atualiza configurações do Vitest;
* atualiza configurações de migrations;
* adapta os comandos conforme o ORM selecionado.

## ORMs e bancos disponíveis

### Prisma

Disponível com:

* PostgreSQL;
* MySQL;
* SQLite.

A CLI ajusta o provider do schema.prisma, a URL do banco e os recursos específicos do provider.

### TypeORM

Disponível com:

* PostgreSQL usando pg;
* MySQL usando mysql2;
* SQLite usando better-sqlite3.

A CLI ajusta:

* DB_TYPE;
* DATABASE_URL;
* tipos de colunas;
* configuração do DataSource;
* scripts de migration;
* driver instalado.

Somente o driver necessário permanece no projeto gerado.

### Drizzle ORM

Disponível com:

* PostgreSQL usando pg;
* MySQL usando mysql2;
* SQLite usando better-sqlite3.

O template Drizzle inclui:

* schema específico para cada banco;
* configuração com Drizzle Kit;
* migrations SQL;
* seed;
* injeção tipada do banco;
* health check baseado no driver selecionado;
* DrizzleSessionStore;
* transações adaptadas ao SQLite.

Depois da geração, somente o schema e o driver do banco selecionado permanecem no projeto.

## Estratégias de autenticação

### JWT

A estratégia JWT mantém:

* cadastro;
* login;
* access token;
* refresh token;
* rotação de refresh token;
* revogação;
* logout;
* OAuth com Google e GitHub;
* recuperação de senha;
* verificação de e-mail.

As rotas de recuperação de senha e verificação de e-mail dependem do recurso Redis, filas e e-mail.

### Session/Cookies

A estratégia Session/Cookies:

* mantém cadastro e login com senha;
* cria uma sessão persistida no banco;
* envia um cookie httpOnly;
* regenera a sessão após o login;
* usa SessionAuthGuard;
* protege operações mutáveis com CSRF;
* destrói a sessão no logout;
* inicia sessão depois dos callbacks OAuth;
* remove arquivos, dependências e variáveis exclusivos de JWT.

Cada template usa uma integração apropriada:

* Prisma usa @quixo3/prisma-session-store;
* TypeORM usa connect-typeorm;
* Drizzle usa o DrizzleSessionStore implementado no próprio template.

### OAuth-only

A estratégia OAuth-only remove os fluxos baseados em senha:

* register;
* login;
* forgot-password;
* reset-password;
* verify-email.

Continuam disponíveis:

* OAuth Google;
* OAuth GitHub;
* access token;
* refresh token;
* logout;
* proteção das rotas autenticadas.

### Nenhuma autenticação

Quando a opção “Nenhuma” é selecionada, a CLI remove completamente:

* src/auth;
* src/users;
* DTOs relacionados;
* guards de autenticação;
* testes de autenticação;
* testes de usuários.

O projeto mantém somente o core selecionado, como health checks, métricas e recursos de infraestrutura.

## Recursos opcionais

### Docker

Quando Docker é desabilitado, a CLI remove:

* Dockerfile;
* docker-compose.yml.

### Swagger/OpenAPI

Quando Swagger é desabilitado, a CLI remove:

* bootstrap do Swagger no main.ts;
* rota /docs;
* decorators como @ApiTags;
* @ApiOperation;
* @ApiResponse;
* demais decorators de documentação.

A pergunta sobre Swagger/OpenAPI também controla a documentação da API. Não existe uma segunda opção separada.

### Validação global

Quando a validação global é desabilitada:

* ZodValidationPipe não é registrado no main.ts;
* o pipe também não é registrado no setup E2E.

Os DTOs continuam existindo como classes, mas deixam de ser validados automaticamente pelo pipe global.

### Redis, filas e e-mail

Quando habilitado, o projeto inclui:

* Redis;
* BullMQ;
* filas de e-mail;
* Nodemailer;
* Mailpit;
* recuperação de senha;
* verificação de e-mail;
* health check do Redis.

Quando desabilitado, os módulos, rotas e dependências relacionados são removidos.

### RBAC e Permissions

Quando habilitado, o projeto inclui:

* roles ADMIN, MANAGER e USER;
* permissions granulares;
* RolesGuard;
* PermissionsGuard;
* decorators de autorização.

Quando desabilitado, guards, decorators e constantes de RBAC são removidos. As rotas continuam exigindo autenticação quando uma estratégia de autenticação estiver ativa, mas deixam de exigir permissions específicas.

### Arquivo .env

Quando solicitado, a CLI cria automaticamente o .env a partir do .env.example já
processado.

## Estado das opções

| Escolha               | Status             |
| --------------------- | ------------------ |
| Linguagem: TypeScript | ✅ Implementada     |
| Linguagem: JavaScript | ✅ Implementada     |
| ORM: Prisma           | ✅ Implementado     |
| ORM: TypeORM          | ✅ Implementado     |
| ORM: Drizzle          | ✅ Implementado     |
| ORM: Nenhum           | ❌ Não implementado |
| Banco: PostgreSQL     | ✅ Implementado     |
| Banco: MySQL          | ✅ Implementado     |
| Banco: SQLite         | ✅ Implementado     |
| Banco: MongoDB        | ❌ Não implementado |
| Auth: JWT             | ✅ Implementada     |
| Auth: Session/Cookies | ✅ Implementada     |
| Auth: OAuth-only      | ✅ Implementada     |
| Auth: Nenhuma         | ✅ Implementada     |

A CLI recusa opções ainda não implementadas antes de criar a pasta do projeto.

## Testes automatizados

Os testes do gerador ficam em:

`packages/cli/test/generator.test.ts`

Execute dentro de packages/cli:

```bash
npm test
```

A cobertura inclui:

* Prisma com PostgreSQL;
* Prisma com MySQL;
* Prisma com SQLite;
* TypeORM com SQLite;
* Drizzle com PostgreSQL;
* Drizzle com MySQL;
* Drizzle com SQLite;
* JWT;
* Session/Cookies;
* OAuth-only;
* nenhuma autenticação;
* TypeScript;
* JavaScript;
* remoção de Redis;
* remoção de recursos opcionais;
* drivers corretos por banco;
* scripts de migrations;
* schemas gerados;
* recusa de opções não implementadas.

## Smoke tests realizados

Foram validadas com instalação, build, testes unitários, migrations, seed e testes E2E:

* TypeScript + TypeORM + SQLite + JWT;
* TypeScript + TypeORM + SQLite + Session/Cookies;
* TypeScript + Drizzle + SQLite + JWT;
* TypeScript + Drizzle + SQLite + Session/Cookies.

PostgreSQL e MySQL possuem testes automatizados de geração, configuração e remoção dos drivers não utilizados. Smoke tests completos desses bancos ainda exigem serviços locais ou Docker.

## Limitações conhecidas

### Redis nos templates anteriores

Nos templates Prisma e TypeORM, o docker-compose.yml e os arquivos de ambiente ainda podem manter serviços ou variáveis de Redis e Mailpit quando o recurso é desabilitado.

Esse conteúdo extra não impede o projeto de compilar ou executar, mas ainda pode ser limpo para deixar a geração completamente enxuta.

### Nenhuma autenticação com Prisma

No template Prisma, o schema.prisma ainda mantém models como User, RefreshToken e OAuthAccount quando nenhuma autenticação é selecionada.

O prisma/seed.ts também pode continuar relacionado aos usuários de demonstração.

O código da aplicação é removido corretamente, mas o schema ainda pode criar tabelas que não serão utilizadas.

### Criação administrativa no OAuth-only

Na estratégia OAuth-only, o endpoint administrativo POST /users continua permitindo a criação manual de um usuário.

A CLI ainda não diferencia a estratégia usada para login da forma como um administrador cadastra usuários pelo painel.

## Desenvolvimento local

Na raiz do monorepo:

```bash
npm install
cd packages/cli
npm run dev
```

O comando npm run dev executa a CLI diretamente pelo TypeScript usando tsx.

Para rodar os testes:

```bash
npm test
```

Para testar como uma CLI instalada:

```bash
npm run build
npm link
nestforge
```

## Publicação

Dentro de packages/cli:

```bash
npm run build
npm pack --dry-run
npm publish
```

O build:

1. compila a CLI;
2. copia os templates Prisma, TypeORM e Drizzle;
3. prepara o pacote publicado no npm.

## Próximos itens

* opção sem ORM;
* MongoDB;
* validação mais completa do nome do projeto e do pacote;
* ampliação da matriz de smoke tests com PostgreSQL e MySQL reais;
* redução das limitações conhecidas dos templates anteriores.
