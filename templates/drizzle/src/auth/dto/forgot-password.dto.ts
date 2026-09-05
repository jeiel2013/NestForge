// nestforge:feature-file:redis,auth:password
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const forgotPasswordSchema = z.object({
    email: z.string().email().describe('Email of the account to recover'),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) { }
