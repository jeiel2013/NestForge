import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const resetPasswordSchema = z.object({
    token: z.string().describe('Token recebido por e-mail'),
    password: z.string().min(8).describe('Nova senha (mínimo 8 caracteres)'),
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) { }