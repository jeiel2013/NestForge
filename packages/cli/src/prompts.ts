import { intro, outro, text, select, multiselect, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';

export type OrmChoice = 'prisma' | 'typeorm' | 'drizzle' | 'none';

export interface ProjectOptions {
    projectName: string;
    orm: OrmChoice;
    features: string[];
}

function handleCancel(value: unknown): void {
    if (isCancel(value)) {
        cancel('Operação cancelada.');
        process.exit(0);
    }
}

export async function runPrompts(): Promise<ProjectOptions> {
    intro(pc.bgCyan(pc.black(' create-nestforge ')));

    // 1. Nome do projeto
    const projectName = await text({
        message: 'Qual o nome do seu projeto?',
        placeholder: 'my-nest-api',
        defaultValue: 'my-nest-api',
    });
    handleCancel(projectName);

    // 2. Escolha do ORM
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

    // 3. Recursos adicionais
    const features = await multiselect({
        message: 'Selecione os recursos adicionais:',
        options: [
            { value: 'docker', label: 'Docker & Docker Compose', hint: 'Configuração pronta' },
            { value: 'swagger', label: 'Documentação Swagger/OpenAPI' },
            { value: 'jwt', label: 'Módulo de Autenticação JWT', hint: 'inclui RBAC e Permissions' },
            { value: 'redis', label: 'Redis', hint: 'cache/filas + e-mail transacional via BullMQ' },
        ],
        required: false,
    });
    handleCancel(features);

    outro(pc.green('Prontinho! Gerando o projeto...'));

    return {
        projectName: projectName as string,
        orm: orm as OrmChoice,
        features: features as string[],
    };
}