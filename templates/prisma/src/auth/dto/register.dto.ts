import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
  name: z.string().min(2).describe('Nome completo do usuário'),
  email: z.string().email().describe('E-mail do usuário'),
  password: z.string().min(8).describe('Senha (mínimo 8 caracteres)'),
});

export class RegisterDto extends createZodDto(registerSchema) { }