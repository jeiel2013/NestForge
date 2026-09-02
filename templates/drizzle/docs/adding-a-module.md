# Adicionando um módulo

Este guia mostra como adicionar um módulo `posts` ao projeto usando NestJS, Drizzle ORM e Zod.

## 1. Adicione a tabela ao schema

Abra o schema correspondente ao banco escolhido:

* PostgreSQL: `src/database/schema/postgres.schema.ts`
* MySQL: `src/database/schema/mysql.schema.ts`
* SQLite: `src/database/schema/sqlite.schema.ts`

Adicione a tabela `posts` usando a implementação correspondente ao banco.

### PostgreSQL

Adicione `index` aos imports, caso ainda não esteja presente, e inclua:

```ts
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', {
      length: 200,
    }).notNull(),
    content: text('content').notNull(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('posts_author_id_idx').on(
      table.authorId,
    ),
  ],
);
```

### MySQL

Adicione:

```ts
export const posts = mysqlTable(
  'posts',
  {
    id: varchar('id', {
      length: 36,
    }).primaryKey(),
    title: varchar('title', {
      length: 200,
    }).notNull(),
    content: text('content').notNull(),
    authorId: varchar('author_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    createdAt: datetime('created_at', {
      mode: 'date',
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at', {
      mode: 'date',
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('posts_author_id_idx').on(
      table.authorId,
    ),
  ],
);
```

### SQLite

Adicione:

```ts
export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .default(sql`(unixepoch() * 1000)`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('posts_author_id_idx').on(
      table.authorId,
    ),
  ],
);
```

No final do schema, adicione os tipos inferidos:

```ts
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

O arquivo `src/database/schema/index.ts` já exporta o schema selecionado pela CLI. Portanto, não é necessário criar outro arquivo de exportação.

## 2. Crie os DTOs

Crie `src/posts/dto/create-post.dto.ts`:

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1),
});

export class CreatePostDto extends createZodDto(
  createPostSchema,
) {}
```

Crie `src/posts/dto/update-post.dto.ts`:

```ts
import { createZodDto } from 'nestjs-zod';
import { createPostSchema } from './create-post.dto';

export const updatePostSchema =
  createPostSchema.partial();

export class UpdatePostDto extends createZodDto(
  updatePostSchema,
) {}
```

## 3. Crie o service

Crie `src/posts/posts.service.ts`:

```ts
import { randomUUID } from 'node:crypto';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  desc,
  eq,
} from 'drizzle-orm';
import { InjectDatabase } from '../database/database.decorators';
import type { DrizzleDatabase } from '../database/database.types';
import {
  posts,
  users,
  type NewPost,
} from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectDatabase()
    private readonly database: DrizzleDatabase,
  ) {}

  async create(
    authorId: string,
    dto: CreatePostDto,
  ) {
    const id = randomUUID();

    const data: NewPost = {
      id,
      title: dto.title,
      content: dto.content,
      authorId,
    };

    await this.database
      .insert(posts)
      .values(data);

    return this.findOne(id);
  }

  async findAll() {
    return this.database
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(
        users,
        eq(posts.authorId, users.id),
      )
      .orderBy(desc(posts.createdAt));
  }

  async findOne(id: string) {
    const [post] = await this.database
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(
        users,
        eq(posts.authorId, users.id),
      )
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      throw new NotFoundException(
        'Post não encontrado',
      );
    }

    return post;
  }

  async update(
    id: string,
    dto: UpdatePostDto,
  ) {
    await this.findOne(id);

    await this.database
      .update(posts)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.database
      .delete(posts)
      .where(eq(posts.id, id));

    return {
      message: 'Post removido com sucesso',
    };
  }
}
```

O ID é criado no service para manter o mesmo comportamento entre PostgreSQL, MySQL e SQLite.

## 4. Crie o controller

Crie `src/posts/posts.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @Post()
  create(
    @Req() request: Request,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(
      request.user.id,
      dto,
    );
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

Se o projeto não usa autenticação, remova `@Req()` e receba o `authorId` de outra forma adequada ao domínio.

## 5. Crie o módulo

Crie `src/posts/posts.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

O `DatabaseModule` é global. Não é necessário registrar tabelas ou repositórios dentro de cada módulo.

Depois, importe `PostsModule` em `src/app.module.ts`:

```ts
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    PostsModule,
  ],
})
export class AppModule {}
```

Preserve os outros módulos que já estiverem registrados no `AppModule`.

## 6. Gere e aplique a migration

Depois de alterar o schema, gere uma migration:

```bash
npm run drizzle:generate
```

Confira os arquivos criados em `drizzle/` antes de aplicar a migration.

Aplique as migrations:

```bash
npm run drizzle:migrate
```

Durante o desenvolvimento, também é possível sincronizar diretamente o schema:

```bash
npm run drizzle:push
```

Prefira migrations em ambientes compartilhados e em produção.

## 7. Adicione testes unitários

Nos testes unitários, injete um mock de `DrizzleDatabase` diretamente no service:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrizzleDatabase } from '../database/database.types';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let database: Record<string, ReturnType<typeof vi.fn>>;
  let service: PostsService;

  beforeEach(() => {
    database = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new PostsService(
      database as unknown as DrizzleDatabase,
    );
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });
});
```

Cada consulta Drizzle usa uma cadeia de métodos. O mock deve reproduzir apenas a cadeia utilizada pelo método testado.

Exemplo para uma consulta que termina em `limit()`:

```ts
const limit = vi.fn().mockResolvedValue([
  {
    id: 'post-1',
    title: 'Meu post',
  },
]);

const where = vi.fn().mockReturnValue({
  limit,
});

const innerJoin = vi.fn().mockReturnValue({
  where,
});

const from = vi.fn().mockReturnValue({
  innerJoin,
});

database.select.mockReturnValue({
  from,
});
```

Use `src/users/users.service.spec.ts` como referência para mocks mais completos.

## 8. Atualize a limpeza E2E

Em `test/utils/clean-database.ts`, importe `posts`:

```ts
import {
  oauthAccounts,
  posts,
  users,
} from '../../src/database/schema';
```

Exclua os posts antes dos usuários por causa da chave estrangeira `posts.author_id`.

Para PostgreSQL e MySQL:

```ts
await transaction.delete(posts);
await transaction.delete(users);
```

Para SQLite:

```ts
transaction.delete(posts).run();
transaction.delete(users).run();
```

No SQLite com `better-sqlite3`, o callback da transação deve ser síncrono e as consultas devem ser executadas com `.run()`.

## 9. Use transações quando necessário

PostgreSQL e MySQL aceitam callbacks assíncronos:

```ts
await this.database.transaction(
  async (transaction) => {
    await transaction
      .insert(posts)
      .values(post);

    await transaction
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, authorId));
  },
);
```

Com SQLite e `better-sqlite3`, use um callback síncrono:

```ts
this.database.transaction(
  (transaction) => {
    transaction
      .insert(posts)
      .values(post)
      .run();

    transaction
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, authorId))
      .run();
  },
);
```

Se o código precisar oferecer os três bancos simultaneamente, mantenha implementações separadas usando os marcadores de banco do NestForge.

## Checklist

* [ ] Tabela adicionada ao schema do banco selecionado
* [ ] Tipos `Post` e `NewPost` exportados
* [ ] DTOs Zod criados
* [ ] Service usa `InjectDatabase` e `DrizzleDatabase`
* [ ] Controller criado
* [ ] Módulo importado no `AppModule`
* [ ] Migration gerada e revisada
* [ ] Migration aplicada
* [ ] Testes unitários adicionados
* [ ] Limpeza dos testes E2E atualizada
* [ ] Transações adaptadas ao driver utilizado
* [ ] Swagger e permissões adicionados, quando aplicáveis
