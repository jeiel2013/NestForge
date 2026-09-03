# Testando o template TypeORM

[English](TESTING.md) | **Português**

Este guia valida um projeto gerado a partir do template TypeORM do NestForge.

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

## Gerar e aplicar uma migration

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
```

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

Os testes unitários simulam os repositories do TypeORM e o Redis, portanto não exigem serviços reais.

## Testes E2E

```bash
npm run test:e2e
```

O script `pretest:e2e` aplica as migrations usando `.env.test` antes do início da suíte.

Dependendo da estratégia de autenticação gerada, a suíte pode cobrir JWT, Session/Cookies, CSRF, CRUD de usuários, RBAC e permissions.

## Verificações específicas por banco

### PostgreSQL

```bash
docker compose up -d postgres
npm run migration:run
```

### MySQL

```bash
docker compose up -d mysql
npm run migration:run
```

### SQLite

Defina a configuração do banco como SQLite e execute:

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run build
npm test
npm run test:e2e
```

Confira o driver nativo quando necessário:

```bash
npm ls better-sqlite3
```

## Checklist final

* [ ] As dependências são instaladas corretamente
* [ ] O driver correto do banco está instalado
* [ ] A migration é gerada e revisada
* [ ] As migrations são aplicadas
* [ ] O seed executa quando aplicável
* [ ] O build passa
* [ ] O lint passa
* [ ] Os testes unitários passam
* [ ] Os testes E2E passam
* [ ] `.env.test` usa um banco isolado
