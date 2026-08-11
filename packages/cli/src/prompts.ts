import { intro, outro, text, select, confirm, isCancel, cancel } from '@clack/prompts';
import gradient from 'gradient-string';
import pc from 'picocolors';

export type OrmChoice = 'prisma' | 'typeorm' | 'drizzle' | 'none';
export type LanguageChoice = 'typescript' | 'javascript';

export interface ProjectOptions {
    projectName: string;
    language: LanguageChoice;
    orm: OrmChoice;
    features: string[];
}

// vermelho -> laranja, as cores do NestJS
const nestforgeGradient = gradient(['#e0234e', '#ff8a65']);

function showBanner(): void {
    console.log();
    console.log(nestforgeGradient.multiline('N E S T F O R G E'));
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
    intro(pc.bgMagenta(pc.black(' 🔥 nestforge ')));

    // 1. Nome do projeto
    const projectName = await text({
        message: '📦 Qual o nome do seu projeto?',
        placeholder: 'my-nest-api',
        defaultValue: 'my-nest-api',
    });
    handleCancel(projectName);

    // 2. Linguagem
    const language = await select({
        message: '🧠 TypeScript ou JavaScript?',
        options: [
            { value: 'typescript', label: 'TypeScript', hint: 'Recomendado' },
            { value: 'javascript', label: 'JavaScript', hint: 'em breve' },
        ],
    });
    handleCancel(language);

    // 3. Escolha do ORM
    const orm = await select({
        message: '🗄️  Escolha o ORM/Query Builder:',
        options: [
            { value: 'prisma', label: 'Prisma', hint: 'Recomendado' },
            { value: 'typeorm', label: 'TypeORM', hint: 'em breve' },
            { value: 'drizzle', label: 'Drizzle ORM', hint: 'em breve' },
            { value: 'none', label: 'Nenhum' },
        ],
    });
    handleCancel(orm);

    // 4. Recursos adicionais (um a um, sim ou não)
    const features: string[] = [];

    const wantsDocker = await confirm({
        message: '🐳 Deseja adicionar Docker?',
        initialValue: true,
    });
    handleCancel(wantsDocker);
    if (wantsDocker) features.push('docker');

    const wantsSwagger = await confirm({
        message: '📄 Deseja incluir documentação Swagger/OpenAPI?',
        initialValue: true,
    });
    handleCancel(wantsSwagger);
    if (wantsSwagger) features.push('swagger');

    const wantsJwt = await confirm({
        message: '🔐 Deseja incluir o módulo de Autenticação JWT?',
        initialValue: true,
    });
    handleCancel(wantsJwt);
    if (wantsJwt) features.push('jwt');

    const wantsRedis = await confirm({
        message: '🧵 Deseja incluir Redis (cache/filas + e-mail via BullMQ)?',
        initialValue: true,
    });
    handleCancel(wantsRedis);
    if (wantsRedis) features.push('redis');

    outro(pc.green('🚀 Prontinho! Gerando o projeto...'));

    return {
        projectName: projectName as string,
        language: language as LanguageChoice,
        orm: orm as OrmChoice,
        features,
    };
}