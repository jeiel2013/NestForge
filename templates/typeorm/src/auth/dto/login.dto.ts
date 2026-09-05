// nestforge:feature-file:auth:password
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const loginSchema = z.object({
  email: z.string().email().describe('User email'),
  password: z.string().min(8).describe('Password'),
});

export class LoginDto extends createZodDto(loginSchema) { }
