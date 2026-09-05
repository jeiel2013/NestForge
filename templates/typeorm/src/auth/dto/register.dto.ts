// nestforge:feature-file:auth:password
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
  name: z.string().min(2).describe('User full name'),
  email: z.string().email().describe('User email'),
  password: z.string().min(8).describe('Password (minimum 8 characters)'),
});

export class RegisterDto extends createZodDto(registerSchema) { }
