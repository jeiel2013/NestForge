import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const loginSchema = z.object({
  email: z.string().email().describe('E-mail do usuário'),
  password: z.string().min(8).describe('Senha'),
});

export class LoginDto extends createZodDto(loginSchema) { }