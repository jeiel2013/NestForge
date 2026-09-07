export type OrmChoice = 'prisma' | 'typeorm' | 'drizzle' | 'none';
export type LanguageChoice = 'typescript' | 'javascript';
export type DatabaseChoice = 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'none';
export type AuthStrategyChoice = 'jwt' | 'session' | 'oauth' | 'none';

export interface ProjectOptions {
    projectName: string;
    language: LanguageChoice;
    orm: OrmChoice;
    database: DatabaseChoice;
    features: string[];
    authStrategy: AuthStrategyChoice;
    accessControl: boolean;
    createEnv: boolean;
}

export interface ProjectOptionInput {
    projectName?: string;
    language?: LanguageChoice;
    orm?: OrmChoice;
    database?: DatabaseChoice;
    docker?: boolean;
    swagger?: boolean;
    validation?: boolean;
    redis?: boolean;
    authStrategy?: AuthStrategyChoice;
    accessControl?: boolean;
    createEnv?: boolean;
}

export const LANGUAGE_CHOICES = ['typescript', 'javascript'] as const;
export const ORM_CHOICES = ['prisma', 'typeorm', 'drizzle', 'none'] as const;
export const DATABASE_CHOICES = ['postgres', 'mysql', 'sqlite', 'mongodb', 'none'] as const;
export const AUTH_STRATEGY_CHOICES = ['jwt', 'session', 'oauth', 'none'] as const;

export const FEATURE_NAMES = ['docker', 'swagger', 'validation', 'redis'] as const;
export type FeatureName = (typeof FEATURE_NAMES)[number];

export const DEFAULT_PROJECT_OPTIONS = {
    language: 'typescript',
    orm: 'prisma',
    database: 'postgres',
    docker: true,
    swagger: true,
    validation: true,
    redis: true,
    authStrategy: 'jwt',
    accessControl: true,
    createEnv: true,
} as const satisfies Omit<ProjectOptionInput, 'projectName'>;
