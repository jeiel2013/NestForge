# Como adicionar um novo módulo

Este guia mostra o passo a passo pra adicionar um recurso novo seguindo as convenções do NestForge, usando um módulo `posts` (posts de blog) como exemplo. Adapte os nomes pro seu caso.

## 1. Adicione o model no Prisma

Em `prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

Não esqueça de adicionar a relação inversa no `model User`:

```prisma
posts Post[]
```

Gere a migration:

```bash
npx prisma migrate dev --name add_posts
```

## 2. Crie a estrutura de pastas

```
src/posts/
├── dto/
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
├── entities/
│   └── post.entity.ts
├── posts.controller.ts
├── posts.service.ts
└── posts.module.ts
```

## 3. DTOs com Zod

`src/posts/dto/create-post.dto.ts`:

```ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createPostSchema = z.object({
  title: z.string().min(3).describe('Título do post'),
  content: z.string().min(10).describe('Conteúdo do post'),
});

export class CreatePostDto extends createZodDto(createPostSchema) {}
```

`src/posts/dto/update-post.dto.ts`:

```ts
import { createZodDto } from 'nestjs-zod';
import { createPostSchema } from './create-post.dto';

export const updatePostSchema = createPostSchema.partial();

export class UpdatePostDto extends createZodDto(updatePostSchema) {}
```

## 4. Entity (o que a API expõe)

`src/posts/entities/post.entity.ts` — mesmo se não houver nada sensível pra esconder agora, criar a entity já deixa o padrão pronto pra quando houver:

```ts
export class PostEntity {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PostEntity>) {
    Object.assign(this, partial);
  }
}
```

## 5. Service (regra de negócio)

`src/posts/posts.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({ data: { ...dto, authorId } });
    return new PostEntity(post);
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post não encontrado');
    return new PostEntity(post);
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.findOne(id);
    const post = await this.prisma.post.update({ where: { id }, data: dto });
    return new PostEntity(post);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post removido com sucesso' };
  }
}
```

## 6. Controller (guards + permissions)

Se o recurso precisa de controle de acesso, adicione a permission em `src/common/constants/permissions.ts` e no mapeamento `src/common/constants/role-permissions.ts` antes de usar:

```ts
// permissions.ts
export enum Permission {
  // ...existentes
  PostCreate = 'post:create',
  PostDelete = 'post:delete',
}
```

`src/posts/posts.controller.ts`:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Permissions(Permission.PostCreate)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.PostDelete)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

## 7. Module

`src/posts/posts.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

Registre no `src/app.module.ts` (dentro do array `imports`):

```ts
import { PostsModule } from './posts/posts.module';
// ...
PostsModule,
```

## 8. Testes

- **Unitário** (`src/posts/posts.service.spec.ts`): mocke o `PrismaService` como em `src/users/users.service.spec.ts` — sem banco real.
- **E2e** (`test/posts.e2e-spec.ts`): use os helpers de `test/utils/e2e-setup.ts` e `test/utils/clean-database.ts` (adicione `prisma.post.deleteMany()` na limpeza) e siga o padrão de `test/users.e2e-spec.ts`.

## Checklist rápido

- [ ] Model no `schema.prisma` + migration
- [ ] DTOs com Zod (`createZodDto`)
- [ ] Entity (mesmo sem campo sensível ainda)
- [ ] Service sem lógica no controller
- [ ] Permissions novas cadastradas em `permissions.ts` e `role-permissions.ts`, se necessário
- [ ] Module registrado no `AppModule`
- [ ] Teste unitário do service
- [ ] Teste e2e do fluxo principal
- [ ] Atualizar `ROADMAP.md` se o módulo fechar um item do roadmap