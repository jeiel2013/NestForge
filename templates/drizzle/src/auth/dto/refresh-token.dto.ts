// nestforge:feature-file:auth:token
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().describe('Refresh token emitido no login'),
});

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) { }