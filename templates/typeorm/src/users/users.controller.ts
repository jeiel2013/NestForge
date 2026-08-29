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
// nestforge:feature:swagger
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
// nestforge:feature:rbac
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions';
// nestforge:feature:rbac:end
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AVATAR_MAX_SIZE_BYTES,
  avatarFileFilter,
  avatarStorage,
} from '../common/utils/avatar-storage.util';

// nestforge:feature:swagger
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
// nestforge:feature:swagger:end

// nestforge:feature:swagger
@ApiTags('users')
@ApiBearerAuth()
// nestforge:feature:swagger:end
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  // nestforge:feature:rbac
  @Permissions(Permission.UserCreate)
  // nestforge:feature:rbac:end
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Cria um usuário (requer permissão user:create)' })
  @ApiResponse({ status: 201, description: 'Usuário criado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:create', schema: { example: FORBIDDEN_EXAMPLE } })
  // nestforge:feature:swagger:end
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  // nestforge:feature:rbac
  @Permissions(Permission.UserRead)
  // nestforge:feature:rbac:end
  // nestforge:feature:swagger
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
  // nestforge:feature:swagger:end
  findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado', schema: { example: USER_EXAMPLE } })
  // nestforge:feature:swagger:end
  findMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findOne(user.id);
  }

  @Post('me/avatar')
  // nestforge:feature:swagger
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
  // nestforge:feature:swagger:end
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
  // nestforge:feature:rbac
  @Permissions(Permission.UserRead)
  // nestforge:feature:rbac:end
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Busca um usuário por id (requer permissão user:read)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado', schema: { example: { statusCode: 404, message: 'Usuário não encontrado' } } })
  // nestforge:feature:swagger:end
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // nestforge:feature:rbac
  @Permissions(Permission.UserUpdate)
  // nestforge:feature:rbac:end
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Atualiza um usuário (requer permissão user:update)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', schema: { example: USER_EXAMPLE } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:update', schema: { example: FORBIDDEN_EXAMPLE } })
  // nestforge:feature:swagger:end
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  // nestforge:feature:rbac
  @Permissions(Permission.UserDelete)
  // nestforge:feature:rbac:end
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Remove um usuário (requer permissão user:delete)' })
  @ApiResponse({ status: 200, description: 'Usuário removido', schema: { example: { message: 'Usuário removido com sucesso' } } })
  @ApiResponse({ status: 403, description: 'Sem a permissão user:delete', schema: { example: FORBIDDEN_EXAMPLE } })
  // nestforge:feature:swagger:end
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}