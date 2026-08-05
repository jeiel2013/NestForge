import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AVATAR_MAX_SIZE_BYTES,
  avatarFileFilter,
  avatarStorage,
} from '../common/utils/avatar-storage.util';

const USER_EXAMPLE = {
  id: 'a1b2c3d4-e5f6-47a8-9b01-234567890abc',
  name: 'Jeiel Alves',
  email: 'jeiel@example.com',
  role: 'USER',
  avatarUrl: null,
  emailVerifiedAt: '2026-01-15T12:00:00.000Z',
  createdAt: '2026-01-10T09:30:00.000Z',
  updatedAt: '2026-01-15T12:00:00.000Z',
};

const FORBIDDEN_EXAMPLE = { statusCode: 403, message: 'Forbidden resource' };

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Permissions(Permission.UserCreate)
  @ApiOperation({ summary: 'Cria um usuário (requer permissão user:create)' })
  @ApiResponse({ status: 201, description: 'Usuário criado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:create', schema: { example: FORBIDDEN_EXAMPLE } })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions(Permission.UserRead)
  @ApiOperation({ summary: 'Lista usuários com paginação e filtros (requer permissão user:read)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada',
    schema: {
      example: {
        data: [USER_EXAMPLE],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    },
  })
  findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado', schema: { example: USER_EXAMPLE } })
  findMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findOne(user.id);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Faz upload do avatar do usuário autenticado' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Avatar atualizado',
    schema: { example: { ...USER_EXAMPLE, avatarUrl: '/uploads/avatars/f47ac10b.png' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de imagem não suportado ou arquivo maior que 2MB',
    schema: { example: { statusCode: 400, message: 'Formato de imagem não suportado (use PNG, JPEG ou WEBP)' } },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter: avatarFileFilter,
      limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user.id, `/uploads/avatars/${file.filename}`);
  }

  @Get(':id')
  @Permissions(Permission.UserRead)
  @ApiOperation({ summary: 'Busca um usuário por id (requer permissão user:read)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado', schema: { example: { statusCode: 404, message: 'Usuário não encontrado' } } })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.UserUpdate)
  @ApiOperation({ summary: 'Atualiza um usuário (requer permissão user:update)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:update', schema: { example: FORBIDDEN_EXAMPLE } })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.UserDelete)
  @ApiOperation({ summary: 'Remove um usuário (requer permissão user:delete)' })
  @ApiResponse({ status: 200, description: 'Usuário removido', schema: { example: { message: 'Usuário removido com sucesso' } } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:delete', schema: { example: FORBIDDEN_EXAMPLE } })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}