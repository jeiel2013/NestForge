# Testando a CLI nestforge (v0.1.0)

Guia para validar a CLI, as combinações geradas e os projetos Prisma e TypeORM.

## 0. Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Docker, somente para testes reais com PostgreSQL, MySQL ou Redis

SQLite pode ser testado sem Docker.

## 1. Preparar o monorepo

Na raiz do repositório:

Set-Location C:\Users\Jeiel\Music\nestforge
npm install

## 2. Testes automatizados da CLI

Execute:

Set-Location .\packages\cli
npm test

O comando executa:

tsx --test test/generator.test.ts

A suíte valida automaticamente:

- Prisma com PostgreSQL e JWT;
- Prisma com MySQL;
- Prisma com SQLite e autenticação “Nenhuma”;
- OAuth-only;
- Session/Cookies;
- TypeORM com SQLite e Session/Cookies;
- geração JavaScript com Prisma;
- geração JavaScript com TypeORM;
- configuração TypeORM para PostgreSQL e MySQL;
- rejeição de Drizzle, MongoDB e ORM “Nenhum”;
- remoção de arquivos e dependências desabilitadas;
- processamento de marcadores internos em arquivos condicionais.

## 3. Rodar a CLI em desenvolvimento

Dentro de packages/cli:

npm run dev

Esse comando executa:

tsx src/index.ts

A CLI cria o projeto em process.cwd(). Para gerar projetos fora do repositório, você também pode executar o código
local a partir de outra pasta:

Set-Location C:\Users\Jeiel\Music

& '.\nestforge\node_modules\.bin\tsx.cmd' `
'.\nestforge\packages\cli\src\index.ts'

## 4. Testar como uma CLI instalada

Na pasta da CLI:

Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build
npm link

Depois, em outra pasta:

Set-Location C:\Users\Jeiel\Music
nestforge

Para desfazer o link:

npm unlink -g nestforge

## 5. Fluxo interativo

A CLI apresenta 11 etapas, sendo que a pergunta de RBAC aparece somente quando existe autenticação.

### Passo 1 — Nome do projeto

Pergunta:

Qual o nome do seu projeto?

Situação Resultado
━━━━━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome informado Usa o nome informado
──────────────────── ───────────────────────────────
Enter direto Usa my-nest-api
──────────────────── ───────────────────────────────
Ctrl+C Cancela sem criar projeto
──────────────────── ───────────────────────────────
Pasta já existente Mostra erro e não sobrescreve

Ainda não existe validação completa para nomes de pacotes npm.

### Passo 2 — Linguagem

Pergunta:

TypeScript ou JavaScript?

Opção Resultado
━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript ✅ Gera fontes .ts
──────────── ──────────────────────────────────
JavaScript ✅ Transpila o template para .js

Na geração JavaScript:

- arquivos .ts são convertidos para .js;
- arquivos de configuração do Vitest passam a usar .js;
- tsconfig.json, tsconfig.build.json e nest-cli.json são removidos;
- scripts de execução deixam de usar Nest CLI;
- scripts Prisma ou TypeORM são ajustados para JavaScript;
- dependências exclusivamente TypeScript são removidas.

### Passo 3 — ORM / Query Builder

Pergunta:

Escolha o ORM/Query Builder:

Opção Hint Resultado
━━━━━━━━━━━━━ ━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━
Prisma Recomendado ✅ Funciona
───────────── ───────────── ──────────────────
TypeORM — ✅ Funciona
───────────── ───────────── ──────────────────
Drizzle ORM Em breve ❌ Erro amigável
───────────── ───────────── ──────────────────
Nenhum — ❌ Erro amigável

### Passo 4 — Banco de dados

Pergunta:

Qual banco de dados você quer usar?

Opção Hint Resultado
━━━━━━━━━━━━ ━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━
PostgreSQL Recomendado ✅ Funciona
──────────── ───────────── ──────────────────
MySQL — ✅ Funciona
──────────── ───────────── ──────────────────
SQLite — ✅ Funciona
──────────── ───────────── ──────────────────
MongoDB Em breve ❌ Erro amigável

Com Prisma, a CLI ajusta:

- provider do schema.prisma;
- DATABASE_URL;
- Docker Compose;
- workflow CI.

Com TypeORM, a CLI ajusta:

- DB_TYPE;
- DATABASE_URL;
- tipos de colunas específicos do banco;
- Docker Compose;
- workflow CI;
- driver instalado.

Drivers TypeORM:

Banco Driver
━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━
PostgreSQL pg
──────────── ────────────────
MySQL mysql2
──────────── ────────────────
SQLite better-sqlite3

Os drivers não selecionados são removidos.

### Passo 5 — Docker

Pergunta:

Deseja adicionar Docker?

Padrão: sim.

Quando a resposta é “Não”:

- Dockerfile é removido;
- docker-compose.yml é removido.

### Passo 6 — Swagger

Pergunta:

Deseja incluir documentação Swagger/OpenAPI?

Padrão: sim.

Quando desabilitado:

- bootstrap do Swagger é removido;
- decorators Swagger são removidos;
- @nestjs/swagger é removido.

### Passo 7 — Validação global

Pergunta:

Deseja validação global (Zod) habilitada?

Padrão: sim.

Quando desabilitada, ZodValidationPipe é removido do bootstrap e da infraestrutura E2E.

Os DTOs Zod continuam existindo como classes.

### Passo 8 — Redis

Pergunta:

Deseja incluir Redis (cache/filas + e-mail via BullMQ)?

Padrão: sim.

Quando desabilitado, são removidos:

- MailModule;
- MailService;
- MailProcessor;
- BullMQ;
- indicador de saúde do Redis;
- recuperação de senha por e-mail;
- verificação de e-mail;
- dependências Redis, BullMQ e Nodemailer.

### Passo 9 — Autenticação

Pergunta:

Qual estratégia de autenticação você quer usar?

Opção Resultado
━━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JWT ✅ Access token, refresh token e OAuth
───────────────── ────────────────────────────────────────
Session/Cookies ✅ Sessão persistente e proteção CSRF
───────────────── ────────────────────────────────────────
OAuth-only ✅ Google/GitHub sem login por senha
───────────────── ────────────────────────────────────────
Nenhuma ✅ Remove autenticação e usuários

#### JWT

Mantém:

- TokenService;
- JwtStrategy;
- JwtAuthGuard;
- refresh tokens persistidos;
- endpoints de refresh e logout;
- OAuth Google e GitHub.

#### Session/Cookies

Mantém:

- SessionService;
- SessionAuthGuard;
- express-session;
- cookie nestforge.sid;
- token CSRF associado à sessão;
- endpoint /auth/csrf-token;
- OAuth Google e GitHub.

Persistência por ORM:

ORM Store
━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prisma @quixo3/prisma-session-store
───────── ──────────────────────────────
TypeORM connect-typeorm

Arquivos e dependências exclusivos de JWT são removidos.

#### OAuth-only

Remove:

- cadastro por senha;
- login por senha;
- recuperação de senha;
- redefinição de senha;
- verificação de e-mail;
- DTOs e testes baseados em senha.

Mantém Google, GitHub e emissão de tokens após o callback OAuth.

#### Nenhuma

Remove completamente:

src/auth/
src/users/

A pergunta de RBAC não aparece.

### Passo 10 — RBAC e Permissions

Pergunta:

Deseja incluir controle de acesso (RBAC + Permissions)?

Essa pergunta aparece somente quando a estratégia de autenticação não é “Nenhuma”.

Quando desabilitado, são removidos:

- RolesGuard;
- PermissionsGuard;
- decorators de roles e permissions;
- constantes de permissions;
- regras específicas aplicadas aos controllers.

As rotas continuam exigindo autenticação.

### Passo 11 — Criação do .env

Pergunta:

Deseja criar o arquivo .env automaticamente?

Quando habilitado:

.env.example → .env

Quando desabilitado, a CLI exibe:

cp .env.example .env

## 6. Comandos finais

### Prisma

A CLI exibe:

cd <nome-do-projeto>
npm install
docker compose up -d <serviços>
npx prisma migrate dev
npm run start:dev

A linha do Docker aparece somente quando Docker estiver habilitado e houver serviços para iniciar.

### TypeORM

A CLI exibe:

cd <nome-do-projeto>
npm install
docker compose up -d <serviços>
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run seed
npm run start:dev

npm run seed aparece somente nas estratégias JWT e Session/Cookies.

## 7. Checklist de geração

### Geral

- [ ] Nome padrão cria my-nest-api
- [ ] Nome customizado atualiza package.json
- [ ] Nome customizado atualiza o título do README
- [ ] Pasta existente não é sobrescrita
- [ ] Ctrl+C cancela sem stacktrace
- [ ] .env é criado quando solicitado
- [ ] .env não é criado quando recusado

### Prisma

- [ ] TypeScript + Prisma + PostgreSQL + JWT
- [ ] TypeScript + Prisma + MySQL + JWT
- [ ] TypeScript + Prisma + SQLite + JWT
- [ ] JavaScript + Prisma + PostgreSQL + JWT
- [ ] Prisma + Session/Cookies
- [ ] Prisma + OAuth-only
- [ ] Prisma + autenticação “Nenhuma”

### TypeORM

- [x] TypeScript + TypeORM + SQLite + JWT
- [x] TypeScript + TypeORM + SQLite + Session/Cookies
- [x] JavaScript + TypeORM + SQLite
- [x] Configuração TypeORM + PostgreSQL
- [x] Configuração TypeORM + MySQL
- [ ] Smoke real com TypeORM + PostgreSQL
- [ ] Smoke real com TypeORM + MySQL

Os testes reais com PostgreSQL e MySQL exigem os bancos disponíveis localmente ou por Docker.

### Recursos opcionais

- [ ] Docker habilitado mantém os arquivos
- [ ] Docker desabilitado remove os arquivos
- [ ] Swagger desabilitado remove código e dependência
- [ ] Validação desabilitada remove o pipe global
- [ ] Redis desabilitado remove código e dependências
- [ ] RBAC desabilitado remove guards, decorators e constantes
- [ ] JWT remove recursos de Session
- [ ] Session remove recursos de JWT
- [ ] OAuth-only remove fluxos de senha
- [ ] Autenticação “Nenhuma” remove auth e users

### Opções não implementadas

- [ ] Drizzle apresenta erro amigável
- [ ] ORM “Nenhum” apresenta erro amigável
- [ ] MongoDB apresenta erro amigável
- [ ] Nenhuma opção recusada cria uma pasta parcial

## 8. Smoke test Prisma com SQLite

SQLite permite validar o projeto sem Docker.

Depois de gerar o projeto:

Set-Location .\<projeto-prisma>

npm install
npm run prisma:generate
npm run build
npm test
npm run prisma:migrate -- --name init
npm run seed
npm run test:e2e

Confira os scripts disponíveis no package.json, pois os nomes podem variar conforme a versão do template.

## 9. Smoke test TypeORM com SQLite

Depois de gerar o projeto:

Set-Location .\<projeto-typeorm>

npm install
npm run build
npm test
npm run migration:generate -- .\src\database\migrations\InitialSchema
npm run migration:run
npm run seed
npm run test:e2e

Valide também:

npm ls better-sqlite3

O template usa uma versão do better-sqlite3 compatível com Node 24.

### Smoke JWT validado

Configuração utilizada:

Linguagem: TypeScript
ORM: TypeORM
Banco: SQLite
Redis: Não
Autenticação: JWT
RBAC: Sim

Resultado validado:

- instalação concluída;
- build concluído;
- testes unitários concluídos;
- migration gerada;
- migration aplicada;
- seed executado;
- testes E2E concluídos.

### Smoke Session/Cookies validado

Configuração utilizada:

Linguagem: TypeScript
ORM: TypeORM
Banco: SQLite
Redis: Não
Autenticação: Session/Cookies
RBAC: Sim

Resultado validado:

- instalação concluída;
- build concluído;
- testes unitários concluídos;
- migration gerada;
- migration aplicada;
- seed executado;
- testes E2E de sessão concluídos.

## 10. Conferência do pacote publicado

O build da CLI deve copiar os templates da raiz para dentro do pacote:

Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build

Confira:

Test-Path .\templates\prisma
Test-Path .\templates\typeorm

Os dois resultados devem ser:

True
True

Depois confira se o pacote contém os arquivos esperados:

npm pack --dry-run

O pacote deve incluir:

dist/
templates/prisma/
templates/typeorm/
README.md
TESTING.md
package.json

## 11. Escopo ainda não implementado

- Drizzle ORM
- Opção sem ORM
- MongoDB
- Validação completa do nome do pacote
- Publicação final no npm

Esses itens devem continuar retornando erro claro enquanto não estiverem implementados.
