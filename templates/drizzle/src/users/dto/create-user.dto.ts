import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from '../../common/constants/role.enum';

export const createUserSchema = z.object({
  name: z.string().min(2).describe('Full name'),
  email: z.string().email().describe('User email'),
  password: z.string().min(8).describe('Password (minimum 8 characters)'),
  role: z.nativeEnum(Role).optional().describe('User role (default: USER)'),
});

export class CreateUserDto extends createZodDto(createUserSchema) { }
