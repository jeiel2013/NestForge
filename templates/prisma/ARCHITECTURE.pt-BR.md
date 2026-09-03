# Arquitetura

[English](ARCHITECTURE.md) | **Português**

Este documento explica como o NestForge está organizado e por que certas decisões de design foram tomadas. O objetivo é que alguém novo no projeto consiga entender o "porquê", não só o "o quê".

## Visão geral

```
Request → main.ts (pipes/filters/interceptors globais)
        → Guards (JwtAuthGuard → RolesGuard → PermissionsGuard)
        → Controller (valida via DTO Zod, delega pro service)
        → Service (regra de negócio, chama o Prisma)
        → Prisma → PostgreSQL
        → Response (passa pelo ClassSerializerInterceptor antes de virar JSON)
```

Cada módulo de domínio (`auth`, `users`, `mail`, `health`, `metrics`) segue a mesma forma:

```
<modulo>/
├── dto/              # entrada — um schema Zod + createZodDto por DTO
├── entities/          # saída — classes com @Exclude() pra campos sensíveis
├── <modulo>.controller.ts   # só orquestra: recebe request, chama o service, devolve
├── <modulo>.service.ts      # regra de negócio de verdade
└── <modulo>.module.ts       # amarra tudo e declara o que exporta
```

Controllers nunca falam com o Prisma diretamente — sempre passam pelo service. Isso mantém a lógica de negócio testável sem precisar subir a aplicação inteira (é por isso que os testes unitários mockam só o Prisma, não o Nest todo).

## Decisões de design (ADR curto)

### Por que Zod (com `nestjs-zod`) em vez de `class-validator`?
`class-validator` obriga a duplicar informação: os decorators de validação (`@IsEmail()`) e os decorators de documentação (`@ApiProperty()`) descrevem a mesma coisa de duas formas diferentes, e é fácil um ficar desatualizado em relação ao outro. Com Zod, o schema é a única fonte de verdade — `nestjs-zod` gera o DTO e o Swagger a partir dele. Ver `src/*/dto/*.dto.ts` e `patchNestJsSwagger()` em `src/main.ts`.

### Por que Prisma sem uma camada de "repository" por cima?
Prisma Client já é, na prática, um repository type-safe — adicionar uma camada de abstração em cima dele só pra "seguir o padrão" adicionaria indireção sem trazer benefício real neste projeto (não há plano de trocar de ORM). Os services chamam `this.prisma.<model>` diretamente.

### Por que permissions são um mapa fixo em código (`ROLE_PERMISSIONS`) e não uma tabela no banco?
Um sistema de permissions 100% dinâmico (tabelas `roles`, `permissions`, `role_permissions`) é overkill pra um boilerplate — a maioria dos projetos que nascem daqui vai ter 3-5 roles fixas. Manter o mapeamento em `src/common/constants/role-permissions.ts` deixa auditável de forma explícita: dá pra ver o array inteiro de permissões de cada role em um arquivo só. Se o seu projeto crescer a ponto de precisar de permissions configuráveis em runtime (ex.: um admin criando roles customizadas pela UI), aí sim vale migrar pra tabela.

### Por que BullMQ para e-mails, e não enviar direto na request?
Enviar e-mail é uma chamada de rede (SMTP) que pode falhar ou demorar — se isso acontecesse dentro do `POST /auth/register`, uma instabilidade no provedor de e-mail deixaria o cadastro lento ou o usuário veria erro mesmo com a conta criada. A fila desacopla isso: a request responde assim que o job é enfileirado, e o `MailProcessor` cuida do envio (com retry) em segundo plano.

### Por que refresh tokens ficam no banco (hasheados) em vez de só confiar no JWT?
Um JWT sozinho não pode ser revogado antes de expirar. Guardar o hash do refresh token no banco permite invalidar sessões de verdade (logout, troca de senha, refresh token roubado) — é por isso que `resetPassword` revoga todos os refresh tokens ativos do usuário.

### Por que `UserEntity` + `ClassSerializerInterceptor` em vez de só um `select` no Prisma?
As duas coisas coexistem de propósito. O `select` evita trazer o `passwordHash` do banco desnecessariamente; o `@Exclude()` na entidade é uma segunda barreira — mesmo que uma query futura esqueça o `select`, o campo não escapa pra resposta HTTP. Defesa em profundidade, não redundância.

### Por que CSRF vem desligado por padrão?
A API usa Bearer token no header `Authorization`, não cookie de sessão. CSRF explora o fato do navegador enviar cookies automaticamente entre origens — isso não se aplica aqui. O middleware existe pronto (`src/common/middleware/csrf.middleware.ts`) pra quem adaptar o boilerplate pra guardar token em cookie.

## Fluxo de autenticação, em detalhe

1. `POST /auth/register` ou `/login` → `AuthService` gera um par `accessToken` (15min) + `refreshToken` (7 dias), e guarda o hash do refresh no banco.
2. Rotas protegidas passam pelo `JwtAuthGuard`, que valida o `accessToken` e popula `req.user` com `{ id, email, role }` (via `JwtStrategy`).
3. `RolesGuard` e `PermissionsGuard` leem `req.user.role` e decidem se a rota é liberada, usando os decorators `@Roles()` / `@Permissions()` da rota.
4. Quando o `accessToken` expira, o client chama `POST /auth/refresh` — o refresh token antigo é revogado e um novo par é emitido (rotação de token).

## Onde adicionar coisa nova

Se você está adicionando um recurso novo (não só mexendo em auth/users), veja [`docs/adding-a-module.md`](docs/adding-a-module.md) — é um passo a passo praticando as convenções acima num módulo do zero.
