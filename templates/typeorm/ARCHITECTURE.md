# Arquitetura

Este documento explica como o NestForge com TypeORM está organizado e por que certas decisões de design foram tomadas.

## Visão geral

````text
Request → main.ts (pipes, filters e interceptors globais)
  → Guards de autenticação e autorização
  → Controller (valida DTO e delega)
  → Service (regra de negócio)
  → Repository do TypeORM
  → PostgreSQL, MySQL ou SQLite
  → ClassSerializerInterceptor
  → Response

Cada módulo de domínio segue a mesma estrutura:

<modulo>/
├── dto/                    # schemas Zod e DTOs
├── entities/               # entidades persistidas pelo TypeORM
├── <modulo>.controller.ts  # recebe a request e chama o service
├── <modulo>.service.ts     # regras de negócio
├── <modulo>.service.spec.ts
└── <modulo>.module.ts      # dependências, repositories e exports

Controllers não acessam repositories diretamente. Toda operação passa pelo service, mantendo as regras de negócio centralizadas e testáveis.

Os módulos registram suas entidades com:

TypeOrmModule.forFeature([
    UserEntity,
])

Os services recebem os repositories com:

@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>

A conexão global fica em src/database/database.module.ts. As opções específicas de PostgreSQL, MySQL e SQLite ficam em src/database/typeorm-options.ts.

## Decisões de design

### Por que Zod em vez de class-validator?

Com Zod, o schema é a fonte principal para validação e documentação. O nestjs-zod transforma schemas em DTOs, enquanto patchNestJsSwagger() permite que o Swagger interprete esses schemas.

Isso reduz a duplicação entre decorators de validação e documentação.

### Por que usar os repositories do TypeORM diretamente?

Repository<Entity> já oferece uma abstração testável e tipada para persistência. Criar outra camada genérica de repository por cima adicionaria indireção sem trazer benefício para este boilerplate.

Os testes unitários substituem os repositories por objetos com vi.fn(), sem precisar iniciar banco ou aplicação Nest completa.

Uma camada adicional pode ser criada posteriormente se o projeto precisar de regras complexas de persistência ou múltiplas fontes de dados.

### Por que synchronize fica desabilitado?

O template usa:

synchronize: false

Mudanças no banco devem passar por migrations versionadas. Isso evita alterações automáticas e potencialmente destrutivas no schema, principalmente em produção.

As migrations são geradas e executadas com:

npm run migration:generate -- src/database/migrations/NomeDaMigration
npm run migration:run

### Por que permissions são um mapa em código?

O mapa ROLE_PERMISSIONS atende projetos com poucas roles fixas e deixa as permissões fáceis de auditar.

Se o projeto precisar de roles criadas dinamicamente, o mapa pode ser substituído por entidades como Role, Permission e RolePermission.

### Por que BullMQ para envio de e-mails?

SMTP é uma operação externa que pode falhar ou demorar. Colocar o envio em uma fila permite que a requisição respondadepois de enfileirar o trabalho, enquanto o MailProcessor realiza o envio e as tentativas posteriores.

### Por que armazenar o hash dos refresh tokens?

Um JWT não pode ser revogado antes de expirar. O armazenamento do hash permite:

  - logout;
  - rotação do refresh token;
  - invalidação após troca de senha;
  - bloqueio da reutilização de tokens revogados.

O token original não é persistido.

### Por que UserEntity usa @Exclude()?

O repository precisa acessar passwordHash em operações como login, mas esse campo nunca deve aparecer na resposta HTTP.

O @Exclude() combinado com ClassSerializerInterceptor cria uma barreira de serialização para impedir o vazamento do hash.

### Por que Session/Cookies usa armazenamento persistente?

A estratégia Session/Cookies usa express-session com connect-typeorm. As sessões ficam na tabela sessions, em vez da memória do processo.

Isso permite reiniciar ou escalar a aplicação sem perder todas as sessões ativas.

### Como funciona a proteção CSRF?

Na estratégia Session/Cookies, a aplicação usa um token CSRF associado à sessão. Requisições que alteram estado precisam enviar esse token pelo header:

x-csrf-token

O middleware compara o token recebido com o token armazenado na sessão.

Na estratégia JWT com Bearer token, o navegador não envia automaticamente a credencial no cookie, então esse fluxo de CSRF não é necessário.

## Estratégias de autenticação

### JWT

1. Cadastro ou login valida o usuário.
2. TokenService emite access e refresh tokens.
3. O hash do refresh token é armazenado no banco.
4. JwtAuthGuard valida o Bearer token.
5. O refresh revoga o token anterior e emite um novo par.
6. O logout revoga o refresh token.

### Session/Cookies

1. Cadastro ou login valida o usuário.
2. A sessão é regenerada para evitar session fixation.
3. O usuário e o token CSRF são armazenados na sessão.
4. O navegador recebe o cookie nestforge.sid.
5. SessionAuthGuard protege as rotas.
6. O logout destrói a sessão.

### OAuth

Google e GitHub são vinculados por OAuthAccountEntity. Se o e-mail ainda não estiver cadastrado, um usuário é criado e associado ao provedor.

## Banco e entidades

As principais entidades são:

- UserEntity;
- OAuthAccountEntity;
- RefreshTokenEntity, quando tokens estiverem habilitados;
- SessionEntity, quando Session/Cookies estiver habilitada;
- entidades de recuperação e verificação de e-mail, quando aplicáveis.

Entidades condicionais usam os marcadores do gerador para que apenas os arquivos e relacionamentos necessários permaneçam no projeto final.

## Onde adicionar um módulo

Para adicionar um novo domínio, consulte docs/adding-a-module.md (docs/adding-a-module.md).


Depois confira:

```powershell
  Select-String `
    -Path '.\templates\typeorm\ARCHITECTURE.md' `
    -Pattern 'Prisma|prisma'
````
