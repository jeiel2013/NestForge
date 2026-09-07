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
