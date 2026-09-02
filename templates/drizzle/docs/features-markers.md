# Marcadores de funcionalidades

O template templates/drizzle funciona como projeto de referência e como fonte usada pela CLI para gerar projetos personalizados.

Os marcadores permitem remover arquivos ou blocos de código conforme as opções selecionadas pelo usuário, como banco de dados, autenticação, Redis, Swagger e RBAC.

## Marcador de bloco

Use um marcador de bloco quando apenas uma parte do arquivo depender de uma funcionalidade.

```ts
// nestforge:feature:swagger
@ApiTags('users')
// nestforge:feature:swagger:end
@Controller('users')
export class UsersController {}
```

Quando swagger estiver habilitado, a CLI mantém o conteúdo e remove somente as linhas dos marcadores.

Quando estiver desabilitado, a CLI remove todo o bloco:

```ts
@Controller('users')
export class UsersController {}
```

O nome da abertura deve ser exatamente igual ao nome do fechamento:

```ts
// nestforge:feature:swagger
// conteúdo opcional
// nestforge:feature:swagger:end
```

Não deixe um marcador aberto. Um fechamento ausente pode fazer a CLI remover o restante do
arquivo.

## Marcador de arquivo inteiro

Use um marcador de arquivo quando todo o arquivo depender de uma funcionalidade.

O marcador deve ser a primeira linha não vazia:

```ts
// nestforge:feature-file:redis
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {}
```

Se redis estiver habilitado, somente a linha do marcador será removida.

Se estiver desabilitado, o arquivo inteiro será excluído.

Depois do processamento, a CLI também remove diretórios que ficarem vazios.

## Marcadores com múltiplos requisitos

Um marcador pode exigir mais de uma funcionalidade usando nomes separados por vírgula:

```ts
// nestforge:feature:redis,auth:password
await this.mailService.sendPasswordResetEmail();
// nestforge:feature:redis,auth:password:end
```

Nesse caso, todas as funcionalidades precisam estar habilitadas.

O bloco acima somente será mantido quando:

* Redis estiver habilitado;
* a estratégia de autenticação usar senha.

A mesma regra funciona para arquivos inteiros:

```ts
// nestforge:feature-file:auth:password,auth:session
```

Não use espaços entre os nomes no marcador. Prefira:

```text
redis,auth:password
```

## Prefixos de comentário aceitos

Os marcadores aceitam comentários iniciados por //:

```ts
// nestforge:feature:swagger
```

Também aceitam comentários iniciados por #, usados em YAML e arquivos de ambiente:

```yaml
# nestforge:feature:redis
redis:
  image: redis:alpine
# nestforge:feature:redis:end
```

Exemplo em .env.example:

```dotenv
# nestforge:feature:auth:session
SESSION_SECRET=troque-este-segredo
SESSION_MAX_AGE=604800000
# nestforge:feature:auth:session:end
```

## Funcionalidades disponíveis

### Funcionalidades selecionadas diretamente

| Nome | Origem |
| ━━━━━━━━━━━━ | ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| docker | Pergunta sobre Docker |
| ──────────── | ────────────────────────────────────── |
| swagger | Pergunta sobre Swagger/OpenAPI |
| ──────────── | ────────────────────────────────────── |
| validation | Pergunta sobre validação global |
| ──────────── | ────────────────────────────────────── |
| redis | Pergunta sobre Redis, filas e e-mail |
| ──────────── | ────────────────────────────────────── |
| rbac | Pergunta sobre RBAC e Permissions |

### Banco de dados

A CLI habilita exatamente um marcador de banco:

| Banco selecionado | Marcador |
| ━━━━━━━━━━━━━━━━━━━ | ━━━━━━━━━━━━━━━━━━━ |
| PostgreSQL | database:postgres |
| ─────────────────── | ─────────────────── |
| MySQL | database:mysql |
| ─────────────────── | ─────────────────── |
| SQLite | database:sqlite |

Exemplo de arquivo exclusivo do PostgreSQL:

```ts
// nestforge:feature-file:database:postgres
import type { Pool } from 'pg';
```

Exemplo de implementações diferentes dentro do mesmo arquivo:

```ts
// nestforge:feature:database:postgres
await client.query('SELECT 1');
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
await client.query('SELECT 1');
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
client.prepare('SELECT 1').get();
// nestforge:feature:database:sqlite:end
```

Esses marcadores são importantes no template Drizzle porque cada driver possui tipos, configuração e comportamento de transação diferentes.

### Autenticação

A CLI cria marcadores internos de acordo com a estratégia escolhida:

| Marcador | Quando é habilitado |
| ━━━━━━━━━━━━━━━ | ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| auth:enabled | JWT, OAuth-only ou Session/Cookies |
| ─────────────── | ──────────────────────────────────── |
| auth:password | JWT ou Session/Cookies |
| ─────────────── | ──────────────────────────────────── |
| auth:token | JWT ou OAuth-only |
| ─────────────── | ──────────────────────────────────── |
| auth:session | Session/Cookies |
| ─────────────── | ──────────────────────────────────── |
| auth:jwt | Estratégia JWT selecionada |
| ─────────────── | ──────────────────────────────────── |
| auth:oauth | Estratégia OAuth-only selecionada |
| ─────────────── | ──────────────────────────────────── |
| auth:none | Nenhuma autenticação selecionada |

Na maior parte do template, devem ser usados os marcadores de capacidade:

* auth:enabled para código compartilhado por qualquer autenticação;
* auth:password para cadastro, login e senha;
* auth:token para access token e refresh token;
* auth:session para sessão persistente e cookies.

Exemplo:

```ts
// nestforge:feature:auth:token
import { TokenService } from './token.service';
// nestforge:feature:auth:token:end
```

Exemplo de código compartilhado por JWT e Session/Cookies:

```ts
// nestforge:feature-file:auth:password
import { LoginDto } from './login.dto';
```

## Marcadores específicos do Drizzle

### Schemas por banco

Cada schema pertence exclusivamente a um banco:

```ts
// nestforge:feature-file:database:postgres
```

```ts
// nestforge:feature-file:database:mysql
```

```ts
// nestforge:feature-file:database:sqlite
```

Depois da geração, somente o schema correspondente ao banco selecionado deve permanecer no projeto.

O arquivo src/database/schema/index.ts também usa blocos para exportar somente o schema selecionado:

```ts
// nestforge:feature:database:postgres
export * from './postgres.schema';
// nestforge:feature:database:postgres:end
```

### Transações do SQLite

PostgreSQL e MySQL usam callbacks assíncronos:

```ts
// nestforge:feature:database:postgres
await database.transaction(
  async (transaction) => {
    await transaction.delete(users);
  },
);
// nestforge:feature:database:postgres:end
```

SQLite com better-sqlite3 usa callback síncrono e .run():

```ts
// nestforge:feature:database:sqlite
database.transaction((transaction) => {
  transaction.delete(users).run();
});
// nestforge:feature:database:sqlite:end
```

Não coloque essas duas implementações no mesmo bloco, pois apenas uma deve permanecer no projeto gerado.

### Tabelas opcionais

Tabelas usadas somente por uma estratégia de autenticação também precisam de marcadores:

```ts
// nestforge:feature:auth:token
export const refreshTokens = sqliteTable(
  'refresh_tokens',
  {
    // colunas
  },
);
// nestforge:feature:auth:token:end
```

Para Session/Cookies:

```ts
// nestforge:feature:auth:session
export const sessions = sqliteTable(
  'sessions',
  {
    // colunas
  },
);
// nestforge:feature:auth:session:end
```

Os imports, tipos, services, testes e limpeza E2E relacionados à tabela também devem usar marcadores compatíveis.

## Dependências do package.json

JSON não aceita comentários. Portanto, não coloque marcadores dentro de package.json.

A remoção de dependências opcionais é controlada por:

packages/cli/src/features/dependencies.ts

O objeto FEATURE_DEPENDENCIES associa cada funcionalidade às dependências que devem ser removidas quando ela estiver desabilitada.

Exemplo conceitual:

```ts
export const FEATURE_DEPENDENCIES = {
  'database:postgres': [
    'pg',
    '@types/pg',
  ],
  'database:mysql': [
    'mysql2',
  ],
  'database:sqlite': [
    'better-sqlite3',
    '@types/better-sqlite3',
  ],
};
```

Ao adicionar uma dependência exclusiva de uma funcionalidade, atualize esse mapeamento.

Dependências compartilhadas pelo template Drizzle, como drizzle-orm e drizzle-kit, não devem ser removidas junto com um driver específico.

## Docker

O Dockerfile e o docker-compose.yml são removidos diretamente pela CLI quando Docker está desabilitado.

Dentro do docker-compose.yml, use marcadores para serviços opcionais:

```yaml
# nestforge:feature:redis
redis:
  image: redis:alpine
# nestforge:feature:redis:end
```

Dependências entre serviços também precisam ser marcadas:

```yaml
depends_on:
  # nestforge:feature:database:postgres
  - postgres
  # nestforge:feature:database:postgres:end
```

Depois da geração, confira se o YAML continua válido em todas as combinações.

## Cuidados ao usar marcadores

### Preserve imports relacionados

Não marque apenas o uso de uma classe e deixe o import para trás.

Incorreto:

```ts
import { TokenService } from './token.service';

// nestforge:feature:auth:token
constructor(
  private readonly tokenService: TokenService,
) {}
// nestforge:feature:auth:token:end
```

Correto:

```ts
// nestforge:feature:auth:token
import { TokenService } from './token.service';
// nestforge:feature:auth:token:end

// nestforge:feature:auth:token
constructor(
  private readonly tokenService: TokenService,
) {}
// nestforge:feature:auth:token:end
```

### Preserve a sintaxe do arquivo

Ao remover um bloco, o código restante precisa continuar válido.

Verifique especialmente:

* vírgulas em arrays e objetos;
* imports parcialmente removidos;
* parâmetros de construtores;
* itens em providers, imports e exports;
* scripts e propriedades YAML;
* chaves e parênteses;
* blocos de transação;
* exports do schema.

### Evite blocos desnecessariamente grandes

Marque somente o trecho exclusivo da funcionalidade. Blocos menores facilitam a revisão e reduzem o risco de remover código compartilhado.

### Evite aninhar marcadores

Prefira um único marcador com múltiplos requisitos:

```ts
// nestforge:feature:redis,auth:password
// conteúdo
// nestforge:feature:redis,auth:password:end
```

Isso é mais seguro do que colocar um marcador dentro de outro.

## Como conferir os marcadores

No PowerShell, liste todos os marcadores do template:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern 'nestforge:feature'
```

Procure marcadores de abertura e fechamento:

```powershell
Get-ChildItem `
  .\templates\drizzle `
  -Recurse `
  -File |
  Select-String -Pattern 'nestforge:feature:|nestforge:feature-file:'
```

A conferência definitiva deve ser feita pelos testes do gerador:

```powershell
Set-Location .\packages\cli
npm test
```

Os testes devem gerar combinações com as funcionalidades habilitadas e desabilitadas.

## Checklist para uma funcionalidade nova

* [ ] Blocos exclusivos possuem marcador de abertura e fechamento
* [ ] Arquivos exclusivos possuem feature-file na primeira linha não vazia
* [ ] Os nomes de abertura e fechamento são idênticos
* [ ] Múltiplos requisitos usam uma lista separada por vírgula
* [ ] Imports exclusivos também estão marcados
* [ ] Providers e exports exclusivos também estão marcados
* [ ] Tabelas e tipos opcionais do schema estão marcados
* [ ] A limpeza E2E considera tabelas opcionais
* [ ] Dependências opcionais foram adicionadas a FEATURE_DEPENDENCIES
* [ ] PostgreSQL, MySQL e SQLite mantêm código válido
* [ ] O projeto foi gerado com a funcionalidade ligada
* [ ] O projeto foi gerado com a funcionalidade desligada
* [ ] O projeto gerado executa build e testes
