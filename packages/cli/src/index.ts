#!/usr/bin/env node
import { note, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { runPrompts } from './prompts.js';
import { generateProject } from './generator.js';
import { handleUpdateNotification } from './update-notifier.js';
import { parseCliArguments } from './cli-arguments.js';
import { CLI_HELP } from './cli-help.js';
import { readPackageInfo } from './package-info.js';
import { CAPABILITIES } from './capabilities.js';
import { formatDoctorReport, runDoctorChecks } from './doctor.js';

async function main() {
    const cli = parseCliArguments(process.argv.slice(2));

    if (cli.command === 'help') {
        console.log(CLI_HELP);
        return;
    }

    if (cli.command === 'version') {
        const packageInfo = await readPackageInfo();
        console.log(packageInfo.version);
        return;
    }

    if (cli.command === 'list') {
        console.log(CAPABILITIES);
        return;
    }

    if (cli.command === 'doctor') {
        const report = await runDoctorChecks();
        console.log(formatDoctorReport(report));
        if (!report.healthy) {
            process.exitCode = 1;
        }
        return;
    }

    const updateResult = cli.checkUpdates
        ? await handleUpdateNotification()
        : 'continue';

    if (updateResult === 'restarted') {
        return;
    }

    const options = await runPrompts();

    try {
        const targetDir = await generateProject(options);
        const relativeDir = path.relative(process.cwd(), targetDir) || '.';
        const dockerServices = [
            !['sqlite', 'none'].includes(options.database)
                ? options.database
                : null,
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
            options.orm === 'none'
                ? []
                : options.orm === 'typeorm'
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
                        ...(options.database === 'mongodb'
                            ? [
                                'npm run prisma:push',
                                ...(shouldRunSeed
                                    ? ['npm run prisma:seed']
                                    : []),
                            ]
                            : ['npx prisma migrate dev']),
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

        note(steps.join('\n'), 'Next steps');

        note(
            [
                'Enjoying NestForge? Visit the repository, leave a star, and help the project grow:',
                'https://github.com/jeiel2013/NestForge',
            ].join('\n'),
            'Support NestForge',
        );

        outro(pc.green(`✅ Project "${options.projectName}" created successfully!`));
    } catch (error) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
