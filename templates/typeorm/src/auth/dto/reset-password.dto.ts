// nestforge:feature-file:redis,auth:password
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const resetPasswordSchema = z.object({
    token: z.string().describe('Token received by email'),
    password: z.string().min(8).describe('New password (minimum 8 characters)'),
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) { }
