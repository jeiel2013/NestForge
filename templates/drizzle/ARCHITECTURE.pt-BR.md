# Arquitetura

[English](ARCHITECTURE.md) | **Português**

Este documento explica como o NestForge com Drizzle ORM está organizado e por que determinadas decisões de design foram tomadas.

## Visão geral

```text
Request → main.ts (pipes, filters e interceptors globais)
  → Guards de autenticação e autorização
  → Controller (recebe DTO e delega)
  → Service (regra de negócio)
  → DrizzleDatabase
  → PostgreSQL, MySQL ou SQLite
  → ClassSerializerInterceptor
  → Response
```

Controllers não acessam o banco diretamente. Toda operação passa por um service, mantendo as regras de negócio centralizadas e testáveis.

## Estrutura dos módulos

Um módulo de domínio normalmente segue esta estrutura:

```text
<modulo>/
├── dto/                    # schemas Zod e DTOs
├── entities/               # classes de resposta e serialização, quando necessárias
├── <modulo>.controller.ts  # recebe a request e chama o service
├── <modulo>.service.ts     # regras de negócio e consultas Drizzle
├── <modulo>.service.spec.ts
└── <modulo>.module.ts      # controllers, providers e exports
```

As tabelas não ficam dentro de cada módulo. Elas são definidas em:

```text
src/database/schema/
├── postgres.schema.ts
├── mysql.schema.ts
├── sqlite.schema.ts
└── index.ts
```

Durante a geração, a CLI mantém somente o schema correspondente ao banco escolhido.

## Conexão com o banco

A conexão global é criada pelo `DatabaseModule`.

Ele fornece dois tokens:

* `DATABASE_CLIENT`: cliente nativo do banco;
* `DRIZZLE_DATABASE`: instância tipada do Drizzle.

Os services recebem o banco com:

```ts
constructor(
  @InjectDatabase()
  private readonly database: DrizzleDatabase,
) {}
```

O decorator `@InjectDatabase()` centraliza o token de injeção e evita que os módulos de domínio conheçam detalhes da criação da conexão.

O cliente nativo é usado apenas quando a API específica do driver é necessária, como no health check e no encerramento da aplicação.

## Schemas por dialect

PostgreSQL, MySQL e SQLite possuem diferenças em tipos, defaults, UUIDs, datas e comandos de upsert.

Por isso o template mantém três schemas:

* `postgres.schema.ts`, usando `drizzle-orm/pg-core`;
* `mysql.schema.ts`, usando `drizzle-orm/mysql-core`;
* `sqlite.schema.ts`, usando `drizzle-orm/sqlite-core`.

Os marcadores da CLI removem os schemas e imports dos bancos não selecionados. O projeto gerado termina com apenas um dialect e um driver.

## Decisões de design

### Por que Zod em vez de class-validator?

Com Zod, o schema é a fonte principal para validação e documentação.

O `nestjs-zod` transforma schemas em DTOs, enquanto `patchNestJsSwagger()` permite que o Swagger interprete esses schemas.

Isso reduz a duplicação entre decorators de validação e documentação.

### Por que usar o Drizzle diretamente nos services?

O query builder do Drizzle já oferece consultas tipadas e próximas do SQL.

Criar uma camada genérica adicional para todas as operações aumentaria a indireção sem trazer benefício imediato para o boilerplate.

Uma camada de persistência própria ainda pode ser criada quando o domínio exigir múltiplas fontes de dados ou regras complexas de acesso.

Nos testes unitários, a instância do Drizzle é substituída por objetos com `vi.fn()`, sem inicializar um banco real.

### Por que usar migrations versionadas?

Alterações no schema devem ser registradas em migrations SQL para que possam ser revisadas e aplicadas de maneira previsível.

Os comandos principais são:

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

O primeiro compara os schemas com os snapshots existentes e gera arquivos em `drizzle/`. O segundo aplica as migrations pendentes no banco configurado.

Para desenvolvimento rápido também existe:

```bash
npm run drizzle:push
```

O uso de `push` é útil em protótipos, mas migrations versionadas são preferíveis em projetos compartilhados e produção.

### Por que as transações SQLite são diferentes?

PostgreSQL e MySQL usam drivers assíncronos. Suas transações recebem callbacks assíncronos e consultas executadas com `await`.

O `better-sqlite3` é síncrono. Nesse driver, a callback da transação não pode retornar uma `Promise`, e as operações são executadas com métodos como `.run()`.

O template usa marcadores de banco para gerar a implementação correta para cada driver.

### Por que permissions são um mapa em código?

O mapa `ROLE_PERMISSIONS` atende projetos com poucas roles fixas e deixa as permissões fáceis de auditar.

Se o projeto precisar de roles dinâmicas, o mapa pode ser substituído por tabelas como `roles`, `permissions` e `role_permissions`.

### Por que BullMQ para envio de e-mails?

SMTP é uma operação externa que pode falhar ou demorar.

Colocar o envio em uma fila permite responder à requisição depois de enfileirar o trabalho, enquanto o worker processa o envio e suas tentativas posteriores.

### Por que armazenar o hash dos refresh tokens?

Um JWT não pode ser revogado antes de expirar. Armazenar seu hash permite:

* logout;
* rotação do refresh token;
* invalidação após troca de senha;
* bloqueio da reutilização de tokens revogados.

O token original não é persistido. Cada refresh token também recebe um `jti` único para impedir colisões quando duas emissões acontecem no mesmo segundo.

### Por que `UserEntity` ainda existe?

No template Drizzle, `UserEntity` não é uma entidade de banco.

Ela é uma classe de resposta usada pelo `ClassSerializerInterceptor`. O decorator `@Exclude()` impede que `passwordHash` seja enviado pela API.

As tabelas e os tipos de persistência ficam nos schemas Drizzle.

### Por que Session/Cookies usa armazenamento persistente?

A estratégia Session/Cookies usa `express-session` com o `DrizzleSessionStore`.

As sessões ficam na tabela `sessions`, em vez da memória do processo. Isso permite reiniciar ou escalar a aplicação sem perder todas as sessões ativas.

O store implementa leitura, escrita, atualização, remoção e expiração usando o banco escolhido.

### Como funciona a proteção CSRF?

Na estratégia Session/Cookies, a aplicação usa um token CSRF associado à sessão.

Requisições que alteram estado precisam enviá-lo pelo header:

```http
x-csrf-token: <token>
```

O middleware compara o valor recebido com o token armazenado na sessão.

Na estratégia JWT com Bearer token, o navegador não envia automaticamente a credencial em um cookie. Por isso esse fluxo CSRF não é necessário.

## Estratégias de autenticação

### JWT

1. Cadastro ou login valida o usuário.
2. `TokenService` emite access e refresh tokens.
3. O hash do refresh token é armazenado no banco.
4. `JwtAuthGuard` valida o Bearer token.
5. O refresh revoga o token anterior e emite um novo par.
6. O logout revoga o refresh token.

### Session/Cookies

1. Cadastro ou login valida o usuário.
2. A sessão é regenerada para evitar session fixation.
3. O usuário e o token CSRF são armazenados na sessão.
4. O navegador recebe o cookie `nestforge.sid`.
5. `SessionAuthGuard` protege as rotas.
6. O logout destrói a sessão.

### OAuth

Google e GitHub são vinculados pela tabela `oauth_accounts`.

Se o e-mail ainda não estiver cadastrado, um usuário é criado e associado ao provedor. O resultado do callback segue a estratégia escolhida: tokens JWT ou sessão persistente.

## Principais tabelas

Os schemas podem incluir:

* `users`;
* `oauth_accounts`;
* `refresh_tokens`, quando autenticação por token estiver habilitada;
* `sessions`, quando Session/Cookies estiver habilitada;
* `password_reset_tokens`, quando recuperação de senha estiver habilitada;
* `email_verification_tokens`, quando verificação de e-mail estiver habilitada.

Tabelas condicionais usam marcadores para que apenas os recursos selecionados permaneçam no projeto gerado.

## Onde adicionar um módulo

Para adicionar um novo domínio seguindo as convenções do template, consulte [Adding a Module](docs/adding-a-module.md).
