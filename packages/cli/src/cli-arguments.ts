import { parseArgs } from 'node:util';
import type { ProjectOptionInput } from './options.js';

export type CliCommand = 'generate' | 'help' | 'version' | 'list' | 'doctor';

export interface ParsedCliArguments {
    command: CliCommand;
    options: ProjectOptionInput;
    nonInteractive: boolean;
    checkUpdates: boolean;
    showBanner: boolean;
}

export function parseCliArguments(args: string[]): ParsedCliArguments {
    const { values, positionals } = parseArgs({
        args,
        allowPositionals: true,
        strict: true,
        options: {
            help: { type: 'boolean', short: 'h' },
            version: { type: 'boolean', short: 'V' },
            list: { type: 'boolean' },
            doctor: { type: 'boolean' },
        },
    });

    const commands = [
        values.help && 'help',
        values.version && 'version',
        values.list && 'list',
        values.doctor && 'doctor',
    ].filter(Boolean) as CliCommand[];

    if (commands.length > 1) {
        throw new Error('Use only one command at a time: --help, --version, --list, or --doctor.');
    }

    return {
        command: commands[0] ?? 'generate',
        options: {
            projectName: positionals[0],
        },
        nonInteractive: false,
        checkUpdates: true,
        showBanner: true,
    };
}
