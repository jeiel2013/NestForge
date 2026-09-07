import { spawn } from 'node:child_process';
import { isCancel, log, note, select } from '@clack/prompts';
import pc from 'picocolors';
import { readPackageInfo } from './package-info.js';
import {
    checkForUpdate,
    dismissUpdatesForToday,
    type UpdateInfo,
} from './update-check.js';

export type UpdateChoice = 'update' | 'continue' | 'dismiss-today';
export type UpdateNotificationResult = 'continue' | 'restarted';

interface UpdateNotifierOptions {
    readCurrentPackage?: typeof readPackageInfo;
    check?: typeof checkForUpdate;
    prompt?: (update: UpdateInfo) => Promise<UpdateChoice>;
    dismiss?: typeof dismissUpdatesForToday;
    runLatest?: () => Promise<boolean>;
}

export function getUpdateProcess(
    platform: NodeJS.Platform = process.platform,
): { command: string; args: string[] } {
    if (platform === 'win32') {
        return {
            command: process.env.ComSpec ?? 'cmd.exe',
            args: [
                '/d',
                '/s',
                '/c',
                'npx --yes nestforge-generator@latest',
            ],
        };
    }

    return {
        command: 'npx',
        args: ['--yes', 'nestforge-generator@latest'],
    };
}

export async function runLatestVersion(): Promise<boolean> {
    return new Promise((resolve) => {
        const updateProcess = getUpdateProcess();
        const child = spawn(
            updateProcess.command,
            updateProcess.args,
            {
                stdio: 'inherit',
                shell: false,
                env: {
                    ...process.env,
                    NESTFORGE_RESTART_ARGS: JSON.stringify(
                        process.argv.slice(2),
                    ),
                },
            },
        );

        let settled = false;
        const finish = (success: boolean) => {
            if (settled) {
                return;
            }

            settled = true;
            resolve(success);
        };

        child.once('error', () => finish(false));
        child.once('exit', (code) => finish(code === 0));
    });
}

async function promptForUpdate(
    update: UpdateInfo,
): Promise<UpdateChoice> {
    note(
        `${pc.dim(update.currentVersion)} ${pc.dim('→')} ${pc.green(update.latestVersion)}`,
        'NestForge update available',
    );

    const choice = await select<UpdateChoice>({
        message: 'How would you like to continue?',
        options: [
            {
                value: 'update',
                label: 'Update and restart',
                hint: 'Recommended',
            },
            {
                value: 'continue',
                label: `Continue with version ${update.currentVersion}`,
            },
            {
                value: 'dismiss-today',
                label: "Don't remind me today",
            },
        ],
    });

    return isCancel(choice) ? 'continue' : choice;
}

export async function handleUpdateNotification(
    options: UpdateNotifierOptions = {},
): Promise<UpdateNotificationResult> {
    try {
        const packageInfo = await (
            options.readCurrentPackage ?? readPackageInfo
        )();
        const update = await (
            options.check ?? checkForUpdate
        )(packageInfo.version);

        if (!update) {
            return 'continue';
        }

        const choice = await (
            options.prompt ?? promptForUpdate
        )(update);

        if (choice === 'dismiss-today') {
            await (
                options.dismiss ?? dismissUpdatesForToday
            )();
            return 'continue';
        }

        if (choice === 'continue') {
            return 'continue';
        }

        log.info('Downloading the latest NestForge version...');
        const updated = await (
            options.runLatest ?? runLatestVersion
        )();

        if (updated) {
            return 'restarted';
        }

        log.warn(
            'The update could not be started. Continuing with the current version.',
        );
        return 'continue';
    } catch {
        return 'continue';
    }
}
