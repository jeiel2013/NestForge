import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from '../../common/constants/role.enum';

export const createUserSchema = z.object({
  name: z.string().min(2).describe('Nome completo'),
  email: z.string().email().describe('E-mail do usuário'),
  password: z.string().min(8).describe('Senha (mínimo 8 caracteres)'),
  role: z.nativeEnum(Role).optional().describe('Role do usuário (padrão: USER)'),
});

export class CreateUserDto extends createZodDto(createUserSchema) { }