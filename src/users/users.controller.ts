import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Permissions(Permission.UserCreate)
  @ApiOperation({ summary: 'Cria um usuário (requer permissão user:create)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions(Permission.UserRead)
  @ApiOperation({ summary: 'Lista usuários (requer permissão user:read)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  findMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Permissions(Permission.UserRead)
  @ApiOperation({ summary: 'Busca um usuário por id (requer permissão user:read)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.UserUpdate)
  @ApiOperation({ summary: 'Atualiza um usuário (requer permissão user:update)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.UserDelete)
  @ApiOperation({ summary: 'Remove um usuário (requer permissão user:delete)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}