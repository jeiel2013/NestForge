import { intro, outro, text, select, confirm, isCancel, cancel } from '@clack/prompts';
import gradient from 'gradient-string';
import pc from 'picocolors';

export type OrmChoice = 'prisma' | 'typeorm' | 'drizzle' | 'none';
export type LanguageChoice = 'typescript' | 'javascript';
export type DatabaseChoice = 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
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

// vermelho -> laranja, as cores do NestJS
const nestforgeGradient = gradient(['#e0234e', '#ff8a65']);

const logo = `
 _   _           _   ______                     
| \ | |         | | |  ____|                    
|  \| | ___  ___| |_| |__ ___  _ __ __ _  ___  
| . \ |/ _ \/ __| __|  __/ _ \| '__/ _  |/ _ \
| |\  |  __/\__ \ |_| | | (_) | | | (_| |  __/
|_| \_|\___||___/\__|_|  \___/|_|  \__, |\___|
                                    __/ |     
                                   |___/      
`;

function showBanner(): void {
    console.log();
    console.log(nestforgeGradient.multiline(logo));
    console.log(pc.dim('  Gere um projeto NestJS pronto pra produção em segundos\n'));
}

function handleCancel(value: unknown): void {
    if (isCancel(value)) {
        cancel('Operação cancelada.');
        process.exit(0);
    }
}

export async function runPrompts(): Promise<ProjectOptions> {
    showBanner();
    intro(pc.bgMagenta(pc.black(' NestForge ')));

    // 1. Nome do projeto
    const projectName = await text({
        message: 'Qual o nome do seu projeto?',
        placeholder: 'my-nest-api',
        defaultValue: 'my-nest-api',
    });
    handleCancel(projectName);

    // 2. Linguagem
    const language = await select({
        message: 'TypeScript ou JavaScript?',
        options: [
            { value: 'typescript', label: 'TypeScript', hint: 'Recomendado' },
            { value: 'javascript', label: 'JavaScript' },
        ],
    });
    handleCancel(language);

    // 3. Escolha do ORM
    const orm = await select({
        message: 'Escolha o ORM/Query Builder:',
        options: [
            { value: 'prisma', label: 'Prisma', hint: 'Recomendado' },
            { value: 'typeorm', label: 'TypeORM', hint: 'em breve' },
            { value: 'drizzle', label: 'Drizzle ORM', hint: 'em breve' },
            { value: 'none', label: 'Nenhum' },
        ],
    });
    handleCancel(orm);

    // 4. Banco de dados
    const database = await select({
        message: 'Qual banco de dados você quer usar?',
        options: [
            { value: 'postgres', label: 'PostgreSQL', hint: 'Recomendado' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'sqlite', label: 'SQLite' },
            { value: 'mongodb', label: 'MongoDB', hint: 'em breve' },
        ],
    });
    handleCancel(database);

    // 5. Recursos adicionais (um a um, sim ou não)
    const features: string[] = [];

    const wantsDocker = await confirm({
        message: 'Deseja adicionar Docker?',
        initialValue: true,
    });
    handleCancel(wantsDocker);
    if (wantsDocker) features.push('docker');

    const wantsSwagger = await confirm({
        message: 'Deseja incluir documentação Swagger/OpenAPI?',
        initialValue: true,
    });
    handleCancel(wantsSwagger);
    if (wantsSwagger) features.push('swagger');

    const wantsValidation = await confirm({
        message: 'Deseja validação global (Zod) habilitada?',
        initialValue: true,
    });
    handleCancel(wantsValidation);
    if (wantsValidation) features.push('validation');

    const wantsRedis = await confirm({
        message: 'Deseja incluir Redis (cache/filas + e-mail via BullMQ)?',
        initialValue: true,
    });
    handleCancel(wantsRedis);
    if (wantsRedis) features.push('redis');

    // 6. Estratégia de autenticação
    const authStrategy = await select({
        message: 'Qual estratégia de autenticação você quer usar?',
        options: [
            { value: 'jwt', label: 'JWT', hint: 'Recomendado — já inclui OAuth Google/GitHub' },
            { value: 'session', label: 'Session/Cookies', hint: 'SessÃ£o persistida no banco' },
            { value: 'oauth', label: 'OAuth (Google/GitHub) apenas', hint: 'sem login por senha' },
            { value: 'none', label: 'Nenhuma' },
        ],
    });
    handleCancel(authStrategy);

    // 7. Controle de acesso (só faz sentido se houver autenticação)
    let accessControl = false;
    if (authStrategy !== 'none') {
        const wantsAccessControl = await confirm({
            message: '🛡️  Deseja incluir controle de acesso (RBAC + Permissions)?',
            initialValue: true,
        });
        handleCancel(wantsAccessControl);
        accessControl = wantsAccessControl as boolean;
    }

    // 8. Criação automática do .env
    const createEnv = await confirm({
        message: 'Deseja criar o arquivo .env automaticamente (a partir do .env.example)?',
        initialValue: true,
    });
    handleCancel(createEnv);

    outro(pc.green('Prontinho! Gerando o projeto...'));

    return {
        projectName: projectName as string,
        language: language as LanguageChoice,
        orm: orm as OrmChoice,
        database: database as DatabaseChoice,
        features,
        authStrategy: authStrategy as AuthStrategyChoice,
        accessControl,
        createEnv: createEnv as boolean,
    };
}
