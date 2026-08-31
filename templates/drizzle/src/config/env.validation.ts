import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().min(1).default('http://localhost:5173'),
  DB_TYPE: z.enum(['postgres', 'mysql', 'sqlite']).default('postgres'),
  DATABASE_URL: z.string().url(),
  // nestforge:feature:auth:token
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  // nestforge:feature:auth:token:end
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().default(1025),
  MAIL_FROM: z.string().default('NestForge <no-reply@nestforge.dev>'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(100),
  // nestforge:feature:auth:session
  ENABLE_CSRF: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default('true'),
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z.coerce.number().positive().default(604800000),
  // nestforge:feature:auth:session:end
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${issues}`);
  }

  return parsed.data;
}
