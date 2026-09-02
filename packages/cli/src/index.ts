#!/usr/bin/env node
import { note, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { runPrompts } from './prompts.js';
import { generateProject } from './generator.js';

async function main() {
    const options = await runPrompts();

    try {
        const targetDir = await generateProject(options);
        const relativeDir = path.relative(process.cwd(), targetDir) || '.';
        const dockerServices = [
            options.database !== 'sqlite' ? options.database : null,
            options.features.includes('redis') ? 'redis' : null,
        ]
            .filter(Boolean)
            .join(' ');

        const shouldRunSeed = [
            'jwt',
            'session',
        ].includes(options.authStrategy);

        const seedSteps = shouldRunSeed
            ? ['npm run seed']
            : [];

        const databaseSteps =
            options.orm === 'typeorm'
                ? [
                    'npm run migration:generate -- src/database/migrations/InitialSchema',
                    'npm run migration:run',
                    ...seedSteps,
                ]
                : options.orm === 'drizzle'
                    ? [
                        'npm run drizzle:generate',
                        'npm run drizzle:migrate',
                        ...seedSteps,
                    ]
                    : [
                        'npx prisma migrate dev',
                    ];

        const steps = [
            `cd ${relativeDir}`,
            ...(options.createEnv ? [] : ['cp .env.example .env']),
            'npm install',
            ...(options.features.includes('docker') && dockerServices
                ? [`docker compose up -d ${dockerServices}`]
                : []),
            ...databaseSteps,
            'npm run start:dev',
        ];

        note(steps.join('\n'), 'Próximos passos');

        outro(pc.green(`✅ Projeto "${options.projectName}" criado com sucesso!`));
    } catch (error) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();