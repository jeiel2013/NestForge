# Testando o template Drizzle

[English](TESTING.md) | **Português**

Este guia valida um projeto gerado a partir do template Drizzle do NestForge.

## Pré-requisitos

* Node.js 20 ou superior
* npm 10 ou superior
* Docker para testar PostgreSQL, MySQL, Redis ou Mailpit

SQLite pode ser testado sem Docker. Confirme que a versão instalada do `better-sqlite3` oferece suporte à sua versão do Node.

## Preparar o ambiente

```bash
npm install
cp .env.example .env
cp .env.example .env.test
```

Use bancos diferentes em `.env` e `.env.test`.

## Gerar e aplicar migrations

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

Revise os arquivos SQL gerados em `drizzle/` antes de aplicá-los em ambientes compartilhados ou de produção.

Execute o seed quando o projeto gerado incluir autenticação por senha:

```bash
npm run seed
```

## Validação estática

```bash
npm run build
npm run lint
```

## Testes unitários

```bash
npm test
```

Para cobertura:

```bash
npm run test:cov
```

Os testes unitários simulam a instância do Drizzle e o Redis, portanto não exigem serviços reais.

## Testes E2E

Gere as migrations pelo menos uma vez antes da primeira execução E2E:

```bash
npm run drizzle:generate
npm run test:e2e
```

O script `pretest:e2e` aplica as migrations usando `.env.test` antes do início da suíte.

Dependendo da estratégia de autenticação gerada, a suíte pode cobrir JWT, Session/Cookies, CSRF, CRUD de usuários, RBAC e permissions.

## Verificações específicas por banco

### PostgreSQL

```bash
docker compose up -d postgres
npm run drizzle:migrate
```

### MySQL

```bash
docker compose up -d mysql
npm run drizzle:migrate
```

### SQLite

Defina a URL do banco como um arquivo local:

```dotenv
DATABASE_URL="file:./dev.db"
```

Depois execute:

```bash
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
npm run build
npm test
npm run test:e2e
```

Confira as dependências e os artefatos das migrations:

```bash
npm ls drizzle-orm drizzle-kit better-sqlite3
```

```powershell
Get-ChildItem .\drizzle -Recurse
```

## Comportamento das transações SQLite

O `better-sqlite3` usa transações síncronas. As callbacks de transação não podem retornar uma `Promise`, e as operações de escrita usam métodos como `.run()`.

PostgreSQL e MySQL usam callbacks de transação assíncronas com `await`.

## Checklist final

* [ ] As dependências são instaladas corretamente
* [ ] O driver correto do banco está instalado
* [ ] As migrations são geradas e revisadas
* [ ] As migrations são aplicadas
* [ ] O seed executa quando aplicável
* [ ] O build passa
* [ ] O lint passa
* [ ] Os testes unitários passam
* [ ] Os testes E2E passam
* [ ] `.env.test` usa um banco isolado
