// nestforge:feature-file:redis
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const forgotPasswordSchema = z.object({
    email: z.string().email().describe('E-mail da conta a ser recuperada'),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) { }