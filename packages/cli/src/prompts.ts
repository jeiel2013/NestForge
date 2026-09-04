import { intro, outro, text, select, confirm, isCancel, cancel } from '@clack/prompts';
import gradient from 'gradient-string';
import pc from 'picocolors';

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

// red -> orange, the NestJS colors
const nestforgeGradient = gradient(['#e0234e', '#ff8a65']);

const logo = `
 _   _           _   ______                     
| \ | |         | | |  ____|                    
|  \| | ___  ___| |_| |__ ___  _ __ __ _  ___  
| . \` |/ _ \/ __| __|  __/ _ \| '__/ _\` |/ _ \\
| |\  |  __/\__ \ |_| | | (_) | | | (_| |  __/
|_| \_|\___||___/\__|_|  \___/|_|  \__, |\___|
                                     __/ |
                                    |___/
`;

function showBanner(): void {
    console.log();
    console.log(nestforgeGradient.multiline(logo));
    console.log(pc.dim('  Generate a production-ready NestJS project in seconds\n'));
}

function handleCancel(value: unknown): void {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

export async function runPrompts(): Promise<ProjectOptions> {
    showBanner();
    intro(pc.bgMagenta(pc.black(' NestForge ')));

    // 1. Project name
    const projectName = await text({
        message: 'What is your project name?',
        placeholder: 'my-nest-api',
        defaultValue: 'my-nest-api',
    });
    handleCancel(projectName);

    // 2. Language
    const language = await select({
        message: 'TypeScript or JavaScript?',
        options: [
            { value: 'typescript', label: 'TypeScript', hint: 'Recommended' },
            { value: 'javascript', label: 'JavaScript' },
        ],
    });
    handleCancel(language);

    // 3. ORM selection
    const orm = await select({
        message: 'Choose the ORM/Query Builder:',
        options: [
            { value: 'prisma', label: 'Prisma', hint: 'Recommended' },
            { value: 'typeorm', label: 'TypeORM' },
            { value: 'drizzle', label: 'Drizzle ORM' },
            { value: 'none', label: 'None' },
        ],
    });
    handleCancel(orm);

    // 4. Database
    let database: DatabaseChoice = 'none';

    if (orm !== 'none') {
        const databaseSelection = await select({
            message: 'Which database do you want to use?',
            options: [
                { value: 'postgres', label: 'PostgreSQL', hint: 'Recommended' },
                { value: 'mysql', label: 'MySQL' },
                { value: 'sqlite', label: 'SQLite' },
                { value: 'mongodb', label: 'MongoDB', hint: 'coming soon' },
            ],
        });
        handleCancel(databaseSelection);
        database = databaseSelection as DatabaseChoice;
    }

    // 5. Additional features (one yes/no prompt at a time)
    const features: string[] = [];

    const wantsDocker = await confirm({
        message: 'Do you want to add Docker?',
        initialValue: true,
    });
    handleCancel(wantsDocker);
    if (wantsDocker) features.push('docker');

    const wantsSwagger = await confirm({
        message: 'Do you want to include Swagger/OpenAPI documentation?',
        initialValue: true,
    });
    handleCancel(wantsSwagger);
    if (wantsSwagger) features.push('swagger');

    const wantsValidation = await confirm({
        message: 'Do you want to enable global validation with Zod?',
        initialValue: true,
    });
    handleCancel(wantsValidation);
    if (wantsValidation) features.push('validation');

    const wantsRedis = await confirm({
        message: 'Do you want to include Redis (cache/queues + email through BullMQ)?',
        initialValue: true,
    });
    handleCancel(wantsRedis);
    if (wantsRedis) features.push('redis');

    // 6. Authentication strategy
    let authStrategy: AuthStrategyChoice = 'none';

    if (orm !== 'none') {
        const authStrategySelection = await select({
            message: 'Which authentication strategy do you want to use?',
            options: [
                { value: 'jwt', label: 'JWT', hint: 'Recommended — includes Google/GitHub OAuth' },
                { value: 'session', label: 'Session/Cookies', hint: 'persistent database-backed session' },
                { value: 'oauth', label: 'OAuth (Google/GitHub) only', hint: 'no password login' },
                { value: 'none', label: 'None' },
            ],
        });
        handleCancel(authStrategySelection);
        authStrategy = authStrategySelection as AuthStrategyChoice;
    }

    // 7. Access control (only applicable when authentication is enabled)
    let accessControl = false;
    if (authStrategy !== 'none') {
        const wantsAccessControl = await confirm({
            message: '🛡️  Do you want to include access control (RBAC + Permissions)?',
            initialValue: true,
        });
        handleCancel(wantsAccessControl);
        accessControl = wantsAccessControl as boolean;
    }

    // 8. Automatic .env creation
    const createEnv = await confirm({
        message: 'Do you want to create the .env file automatically (from .env.example)?',
        initialValue: true,
    });
    handleCancel(createEnv);

    outro(pc.green('All set! Generating the project...'));

    return {
        projectName: projectName as string,
        language: language as LanguageChoice,
        orm: orm as OrmChoice,
        database,
        features,
        authStrategy,
        accessControl,
        createEnv: createEnv as boolean,
    };
}
