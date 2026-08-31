# Adicionando um módulo

Este guia mostra como adicionar um módulo `posts` ao projeto usando NestJS, TypeORM e Zod.

## 1. Crie a entidade

Crie `src/posts/entities/post.entity.ts`:

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    name: 'author_id',
    type: 'varchar',
    length: 36,
  })
  authorId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'author_id',
  })
  author!: UserEntity;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  constructor(partial?: Partial<PostEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
```

## 2. Crie os DTOs

Crie `src/posts/dto/create-post.dto.ts`:

```ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200),
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
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async create(
    authorId: string,
    dto: CreatePostDto,
  ) {
    const post = this.postsRepository.create({
      ...dto,
      authorId,
    });

    return this.postsRepository.save(post);
  }

  async findAll() {
    return this.postsRepository.find({
      relations: {
        author: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        author: true,
      },
    });

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
    const post = await this.findOne(id);

    Object.assign(post, dto);

    return this.postsRepository.save(post);
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    await this.postsRepository.remove(post);

    return {
      message: 'Post removido com sucesso',
    };
  }
}
```

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
import { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

Se o projeto não usa autenticação, remova `@Req()` e receba `authorId` de outra forma adequada ao domínio.

## 5. Registre o repository no módulo

Crie `src/posts/posts.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

Depois importe `PostsModule` em `src/app.module.ts`.

## 6. Gere e aplique a migration

```bash
npm run migration:generate -- src/database/migrations/AddPosts
npm run migration:run
```

Confira o arquivo gerado antes de executar a migration em produção.

Para desfazer a última migration:

```bash
npm run migration:revert
```

## 7. Adicione testes unitários

O teste unitário deve mockar o repository:

```ts
import { Repository } from 'typeorm';
import { vi } from 'vitest';
import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';

const postsRepository = {
  findOne: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
};

const postsService = new PostsService(
  postsRepository as unknown as Repository<PostEntity>,
);
```

Dessa forma, o teste não precisa iniciar o Nest nem conectar ao banco.

## 8. Atualize a limpeza E2E

Em `test/utils/clean-database.ts`, exclua posts antes de usuários:

```ts
await manager
  .createQueryBuilder()
  .delete()
  .from(PostEntity)
  .execute();
```

A ordem é importante por causa da chave estrangeira `posts.author_id`.

## 9. Use transações quando necessário

Quando várias operações precisarem ser atômicas, injete `DataSource`:

```ts
constructor(
  private readonly dataSource: DataSource,
) {}
```

E execute:

```ts
await this.dataSource.transaction(
  async (manager) => {
    await manager.save(...);
    await manager.update(...);
  },
);
```

Se uma operação falhar, a transação inteira será revertida.

## Checklist

- [ ] Entidade criada
- [ ] DTOs Zod criados
- [ ] Service usa `Repository<Entity>`
- [ ] Repository registrado com `TypeOrmModule.forFeature`
- [ ] Controller criado
- [ ] Módulo importado no `AppModule`
- [ ] Migration gerada e revisada
- [ ] Migration aplicada
- [ ] Testes unitários adicionados
- [ ] Limpeza dos testes E2E atualizada
- [ ] Swagger e permissões adicionados, quando aplicáveis
