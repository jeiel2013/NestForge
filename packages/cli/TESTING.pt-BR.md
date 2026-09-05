# Testando a CLI `nestforge`

[English](TESTING.md) | **Português**

Guia para validar a CLI, as combinações geradas e os projetos Prisma, TypeORM e Drizzle.

## 1. Pré-requisitos

* Node.js 20 ou superior;
* npm 10 ou superior;
* Docker apenas para testes reais com PostgreSQL, MySQL, MongoDB ou Redis.

SQLite pode ser testado sem Docker.

Dependências como `better-sqlite3` podem exigir uma versão compatível com a versão do Node utilizada.

## 2. Preparar o monorepo

No PowerShell:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge
npm install
```

Depois, entre na pasta da CLI:

```powershell
Set-Location .\packages\cli
```

## 3. Executar os testes automatizados

Dentro de `packages/cli`:

```bash
npm test
```

Esse comando executa:

```bash
tsx --test test/generator.test.ts
```

A suíte valida automaticamente:

* Prisma com PostgreSQL e JWT;
* Prisma com MySQL;
* Prisma com SQLite;
* Prisma com MongoDB e JWT;
* Prisma com MongoDB e Session/Cookies;
* Prisma com MongoDB em JavaScript;
* OAuth-only;
* autenticação sem senha;
* autenticação por Session/Cookies;
* projetos sem autenticação;
* TypeORM com SQLite e Session/Cookies;
* TypeORM com PostgreSQL e MySQL;
* Drizzle com SQLite e JWT;
* Drizzle com SQLite e Session/Cookies;
* Drizzle com PostgreSQL e MySQL;
* JavaScript com Prisma;
* JavaScript com TypeORM;
* JavaScript com Drizzle;
* remoção de recursos desabilitados;
* remoção de dependências desnecessárias;
* seleção do driver correto;
* configuração dos scripts de migrations;
* processamento dos marcadores;
* geração sem ORM em TypeScript e JavaScript;
* recusa de MongoDB com ORMs incompatíveis e combinações inválidas sem ORM.

Resultado esperado:

```text
pass 19
fail 0
```

A quantidade de testes pode aumentar conforme novos casos forem adicionados. O critério principal é não existir teste com falha.

## 4. Executar a CLI em desenvolvimento

Dentro de `packages/cli`:

```bash
npm run dev
```

O comando executa a CLI diretamente pelo TypeScript:

```bash
tsx src/index.ts
```

A pasta do projeto é criada no diretório atual.

Para gerar um projeto fora do repositório usando o código local:

```powershell
Set-Location C:\Users\Jeiel\Music

& '.\nestforge\node_modules\.bin\tsx.cmd' `
  '.\nestforge\packages\cli\src\index.ts'
```

## 5. Testar como uma CLI instalada

Na pasta da CLI:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build
npm link
```

Depois, em outra pasta:

```powershell
Set-Location C:\Users\Jeiel\Music
nestforge
```

Para desfazer o link global:

```bash
npm unlink -g nestforge
```

## 6. Fluxo interativo

A CLI apresenta até 11 perguntas. A pergunta de RBAC aparece somente quando alguma autenticação é selecionada.

| Nº | Pergunta                 | Opções                                      | Status                 |
| -: | ------------------------ | ------------------------------------------- | ---------------------- |
|  1 | Nome do projeto          | Texto livre                                 | ✅                      |
|  2 | Linguagem                | TypeScript ou JavaScript                    | ✅ Ambas                |
|  3 | ORM / Query Builder      | Prisma, TypeORM, Drizzle ou Nenhum          | ✅ Todas as opções      |
|  4 | Banco de dados           | PostgreSQL, MySQL, SQLite ou MongoDB        | ✅ MongoDB com Prisma; SQL com todos os ORMs |
|  5 | Docker                   | Sim ou não                                  | ✅                      |
|  6 | Swagger/OpenAPI          | Sim ou não                                  | ✅                      |
|  7 | Validação global com Zod | Sim ou não                                  | ✅                      |
|  8 | Redis, filas e e-mail    | Sim ou não                                  | ✅                      |
|  9 | Autenticação             | JWT, Session/Cookies, OAuth-only ou Nenhuma | ✅                      |
| 10 | RBAC e Permissions       | Sim ou não                                  | ✅ Condicional          |
| 11 | Criar `.env`             | Sim ou não                                  | ✅                      |

### Nome do projeto

| Situação                | Resultado esperado           |
| ----------------------- | ---------------------------- |
| Nome informado          | Usa o nome informado         |
| Enter sem informar nome | Usa `my-nest-api`            |
| Ctrl+C                  | Cancela sem criar projeto    |
| Pasta já existente      | Exibe erro e não sobrescreve |
| Letras maiúsculas, espaços ou caracteres incompatíveis | Recusa o nome |
| Separador de caminho, caminho absoluto ou escopo npm | Recusa o nome antes de gravar arquivos |
| Mais de 214 caracteres | Recusa o nome |
| Nome reservado do npm ou do Windows | Recusa o nome |

A mesma validação é executada no prompt interativo e na API do gerador.

### Linguagem

| Opção      | Resultado                                               |
| ---------- | ------------------------------------------------------- |
| TypeScript | Mantém fontes e configurações `.ts`                     |
| JavaScript | Transpila o template e atualiza scripts e configurações |

Na geração JavaScript:

* arquivos `.ts` são convertidos para `.js`;
* configurações do Vitest passam a usar JavaScript;
* configurações de migrations são atualizadas;
* `tsconfig.json` e arquivos exclusivos do TypeScript são removidos;
* scripts deixam de depender do Nest CLI e de executores TypeScript;
* dependências exclusivamente TypeScript são removidas.

### ORM / Query Builder

| Opção       | Resultado                 |
| ----------- | ------------------------- |
| Prisma      | ✅ Gera o template Prisma  |
| TypeORM     | ✅ Gera o template TypeORM |
| Drizzle ORM | ✅ Gera o template Drizzle |
| Nenhum      | ✅ Gera sem integração com banco ou autenticação |

### Banco de dados

| Opção      | Resultado                                |
| ---------- | ---------------------------------------- |
| PostgreSQL | ✅ Funciona com Prisma, TypeORM e Drizzle |
| MySQL      | ✅ Funciona com Prisma, TypeORM e Drizzle |
| SQLite     | ✅ Funciona com Prisma, TypeORM e Drizzle |
| MongoDB    | ✅ Funciona com Prisma; recusado com TypeORM e Drizzle |

A CLI deve remover os drivers dos bancos que não foram selecionados.

| Banco      | Driver TypeORM/Drizzle |
| ---------- | ---------------------- |
| PostgreSQL | `pg`                   |
| MySQL      | `mysql2`               |
| SQLite     | `better-sqlite3`       |

### Docker

Quando desabilitado, devem ser removidos:

```text
Dockerfile
docker-compose.yml
```

### Swagger/OpenAPI

Quando desabilitado:

* o bootstrap do Swagger é removido;
* a rota `/docs` deixa de existir;
* decorators Swagger são removidos;
* `@nestjs/swagger` é removido das dependências.

### Validação global

Quando desabilitada:

* `ZodValidationPipe` é removido do bootstrap;
* o pipe também é removido do setup E2E.

Os DTOs continuam existindo, mas deixam de ser validados pelo pipe global.

### Redis, filas e e-mail

Quando desabilitado, devem ser removidos:

* `MailModule`;
* `MailService`;
* `MailProcessor`;
* BullMQ;
* Redis;
* indicador de saúde do Redis;
* recuperação de senha por e-mail;
* verificação de e-mail;
* dependências relacionadas.

### Autenticação JWT

Deve manter:

* cadastro;
* login;
* `TokenService`;
* `JwtStrategy`;
* `JwtAuthGuard`;
* access token;
* refresh token;
* rotação e revogação;
* logout;
* OAuth Google e GitHub.

Deve remover os recursos exclusivos de Session/Cookies.

### Session/Cookies

Deve manter:

* cadastro;
* login;
* `SessionService`;
* `SessionAuthGuard`;
* `express-session`;
* cookie `nestforge.sid`;
* endpoint `/auth/csrf-token`;
* proteção CSRF;
* persistência da sessão;
* OAuth Google e GitHub.

Persistência utilizada:

| ORM     | Store                          |
| ------- | ------------------------------ |
| Prisma  | `@quixo3/prisma-session-store` |
| TypeORM | `connect-typeorm`              |
| Drizzle | `DrizzleSessionStore`          |

Deve remover arquivos, dependências, variáveis e scripts exclusivos de JWT.

### OAuth-only

Deve remover:

* cadastro por senha;
* login por senha;
* recuperação de senha;
* redefinição de senha;
* verificação de e-mail;
* DTOs baseados em senha;
* testes baseados em senha.

Deve manter:

* Google OAuth;
* GitHub OAuth;
* emissão de tokens;
* refresh;
* logout;
* proteção das rotas autenticadas.

### Nenhuma autenticação

Deve remover completamente:

```text
src/auth
src/users
```

A pergunta de RBAC não deve aparecer.

### RBAC e Permissions

Quando desabilitado, devem ser removidos:

* `RolesGuard`;
* `PermissionsGuard`;
* decorators de roles;
* decorators de permissions;
* constantes de permissions;
* regras de RBAC dos controllers.

As rotas continuam exigindo autenticação quando alguma estratégia estiver ativa.

### Criação do `.env`

Quando habilitado:

```text
.env.example → .env
```

Quando desabilitado, a CLI deve exibir:

```bash
cp .env.example .env
```

## 7. Comandos finais exibidos

### Prisma

```bash
cd <nome-do-projeto>
npm install
docker compose up -d <serviços>
npx prisma migrate dev
npm run start:dev
```

A linha do Docker aparece somente quando Docker está habilitado e existe algum serviço para iniciar.

Para Prisma com MongoDB, a etapa de banco é:

```bash
npm run prisma:push
npm run prisma:seed
```

MongoDB usa `db push` no lugar do Prisma Migrate e deve funcionar como replica set para operações transacionais.

### TypeORM

```bash
cd <nome-do-projeto>
npm install
docker compose up -d <serviços>
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run seed
npm run start:dev
```

### Drizzle

```bash
cd <nome-do-projeto>
npm install
docker compose up -d <serviços>
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run start:dev
```

O comando `npm run seed` aparece somente para JWT e Session/Cookies.

### Sem ORM

```bash
cd <nome-do-projeto>
npm install
npm run start:dev
```

Não existem comandos de banco, migration, seed ou autenticação.

## 8. Checklist geral de geração

* [ ] Nome padrão cria `my-nest-api`
* [ ] Nome personalizado atualiza `package.json`
* [ ] Nome personalizado atualiza o título do README
* [ ] Pasta existente não é sobrescrita
* [ ] Ctrl+C cancela sem stack trace
* [ ] `.env` é criado quando solicitado
* [ ] `.env` não é criado quando recusado
* [ ] Docker desabilitado remove os arquivos
* [ ] Swagger desabilitado remove código e dependência
* [ ] Validação desabilitada remove o pipe global
* [ ] Redis desabilitado remove código e dependências
* [ ] RBAC desabilitado remove guards, decorators e constantes
* [ ] JWT remove recursos de Session/Cookies
* [ ] Session/Cookies remove recursos de JWT
* [ ] OAuth-only remove fluxos de senha
* [ ] Nenhuma autenticação remove auth e users
* [x] ORM “Nenhum” remove as integrações de banco e autenticação
* [x] MongoDB é aceito com Prisma
* [x] MongoDB é recusado com TypeORM e Drizzle antes de criar a pasta

## 9. Checklist Prisma

* [ ] TypeScript + Prisma + PostgreSQL + JWT
* [ ] TypeScript + Prisma + MySQL + JWT
* [ ] TypeScript + Prisma + SQLite + JWT
* [x] TypeScript + Prisma + MongoDB + JWT
* [x] TypeScript + Prisma + MongoDB + Session/Cookies
* [x] JavaScript + Prisma + MongoDB
* [ ] JavaScript + Prisma
* [ ] Prisma + Session/Cookies
* [ ] Prisma + OAuth-only
* [ ] Prisma + nenhuma autenticação

## 10. Checklist TypeORM

* [x] TypeScript + TypeORM + SQLite + JWT
* [x] TypeScript + TypeORM + SQLite + Session/Cookies
* [x] JavaScript + TypeORM + SQLite
* [x] Configuração TypeORM + PostgreSQL
* [x] Configuração TypeORM + MySQL
* [ ] Smoke real TypeORM + PostgreSQL
* [ ] Smoke real TypeORM + MySQL

## 11. Checklist Drizzle

* [x] TypeScript + Drizzle + SQLite + JWT
* [x] TypeScript + Drizzle + SQLite + Session/Cookies
* [x] JavaScript + Drizzle
* [x] Configuração Drizzle + PostgreSQL
* [x] Configuração Drizzle + MySQL
* [x] Schema correto para PostgreSQL
* [x] Schema correto para MySQL
* [x] Schema correto para SQLite
* [x] Remoção dos drivers não selecionados
* [x] Scripts Drizzle em TypeScript
* [x] Scripts Drizzle em JavaScript
* [ ] Smoke real Drizzle + PostgreSQL
* [ ] Smoke real Drizzle + MySQL

Os smoke tests reais com PostgreSQL e MySQL exigem os bancos disponíveis localmente ou por Docker.

### Checklist sem ORM

* [x] TypeScript sem ORM, banco ou autenticação
* [x] JavaScript sem ORM, com Docker e Redis
* [x] Dependências e scripts do Prisma são removidos
* [x] Variáveis de ambiente do banco são removidas
* [x] Combinações inválidas sem ORM são recusadas antes da criação da pasta

## 12. Smoke test Prisma com SQLite

Depois de gerar o projeto:

```powershell
Set-Location .\<projeto-prisma>
```

```bash
npm install
npm run prisma:generate
npm run build
npm test
npm run prisma:migrate -- --name init
npm run seed
npm run test:e2e
```

Confira os scripts disponíveis no `package.json`, pois eles podem variar conforme a versão do template.

## 13. Smoke test TypeORM com SQLite

Depois de gerar o projeto:

```powershell
Set-Location .\<projeto-typeorm>
```

```bash
npm install
npm run build
npm test
npm run migration:generate -- .\src\database\migrations\InitialSchema
npm run migration:run
npm run seed
npm run test:e2e
```

Confira o driver:

```bash
npm ls better-sqlite3
```

### Smokes TypeORM validados

Configurações validadas:

```text
TypeScript + TypeORM + SQLite + JWT
TypeScript + TypeORM + SQLite + Session/Cookies
```

Resultados:

* instalação concluída;
* build concluído;
* testes unitários concluídos;
* migration gerada;
* migration aplicada;
* seed executado;
* testes E2E concluídos.

## 14. Smoke test Drizzle com SQLite

Depois de gerar o projeto:

```powershell
Set-Location .\<projeto-drizzle>
```

```bash
npm install
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run build
npm test
npm run test:e2e
```

O `pretest:e2e` aplica automaticamente as migrations usando o banco definido em `.env.test`.

Confira as dependências:

```bash
npm ls drizzle-orm drizzle-kit better-sqlite3
```

Confira os artefatos de migrations:

```powershell
Get-ChildItem .\drizzle -Recurse
```

### Smoke Drizzle com JWT validado

Configuração:

```text
Linguagem: TypeScript
ORM: Drizzle
Banco: SQLite
Redis: Não
Autenticação: JWT
RBAC: Sim
```

Resultado:

* instalação concluída;
* migrations geradas;
* migrations aplicadas;
* seed executado;
* build concluído;
* testes unitários concluídos;
* testes E2E concluídos.

### Smoke Drizzle com Session/Cookies validado

Configuração:

```text
Linguagem: TypeScript
ORM: Drizzle
Banco: SQLite
Redis: Não
Autenticação: Session/Cookies
RBAC: Sim
```

Resultado:

* instalação concluída;
* migrations geradas;
* migrations aplicadas;
* seed executado;
* build concluído;
* testes unitários concluídos;
* testes de CSRF concluídos;
* testes E2E de sessão concluídos.

## 15. Varredura do template Drizzle

Confira referências indevidas a Prisma ou TypeORM:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern `
    '@prisma/client|PrismaService|PrismaModule|@nestjs/typeorm|typeorm|TypeOrm|DataSource|InjectRepository|Repository'
```

Referências em arquivos executáveis indicam algo que precisa ser revisado.

Referências históricas ou comparativas em documentação devem ser avaliadas individualmente.

Confira os marcadores:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern 'nestforge:feature'
```

## 16. Conferir o pacote publicado

Na pasta da CLI:

```powershell
Set-Location C:\Users\Jeiel\Music\nestforge\packages\cli
npm run build
```

Confira os templates copiados:

```powershell
Test-Path .\templates\prisma
Test-Path .\templates\typeorm
Test-Path .\templates\drizzle
```

Resultado esperado:

```text
True
True
True
```

Confira o conteúdo do pacote:

```bash
npm pack --dry-run
```

O pacote deve incluir:

```text
dist/
templates/prisma/
templates/typeorm/
templates/drizzle/
README.md
TESTING.md
package.json
```

## 17. Escopo ainda não implementado

* suporte a MongoDB além do Prisma;
* smoke tests reais de PostgreSQL;
* smoke tests reais de MySQL;
* publicação final no npm.

Combinações MongoDB com TypeORM ou Drizzle devem retornar um erro claro antes da criação da pasta do projeto.
