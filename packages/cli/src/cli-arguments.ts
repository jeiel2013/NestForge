import { parseArgs } from 'node:util';
import {
    AUTH_STRATEGY_CHOICES,
    DATABASE_CHOICES,
    LANGUAGE_CHOICES,
    ORM_CHOICES,
    type AuthStrategyChoice,
    type DatabaseChoice,
    type LanguageChoice,
    type OrmChoice,
    type ProjectOptionInput,
} from './options.js';

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
            name: { type: 'string' },
            language: { type: 'string' },
            orm: { type: 'string' },
            database: { type: 'string' },
            auth: { type: 'string' },
            'non-interactive': { type: 'boolean' },
            yes: { type: 'boolean', short: 'y' },
            docker: { type: 'boolean' },
            'no-docker': { type: 'boolean' },
            swagger: { type: 'boolean' },
            'no-swagger': { type: 'boolean' },
            validation: { type: 'boolean' },
            'no-validation': { type: 'boolean' },
            redis: { type: 'boolean' },
            'no-redis': { type: 'boolean' },
            'access-control': { type: 'boolean' },
            'no-access-control': { type: 'boolean' },
            env: { type: 'boolean' },
            'no-env': { type: 'boolean' },
            'no-update-check': { type: 'boolean' },
            'no-banner': { type: 'boolean' },
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

    if (positionals.length > 1) {
        throw new Error('Only one positional project name is allowed.');
    }

    if (values.name && positionals[0] && values.name !== positionals[0]) {
        throw new Error('The positional project name and --name must match when both are provided.');
    }

    const projectName = values.name ?? positionals[0];

    return {
        command: commands[0] ?? 'generate',
        options: {
            projectName,
            language: parseChoice(values.language, LANGUAGE_CHOICES, '--language') as LanguageChoice | undefined,
            orm: parseChoice(values.orm, ORM_CHOICES, '--orm') as OrmChoice | undefined,
            database: parseChoice(values.database, DATABASE_CHOICES, '--database') as DatabaseChoice | undefined,
            authStrategy: parseChoice(values.auth, AUTH_STRATEGY_CHOICES, '--auth') as AuthStrategyChoice | undefined,
            docker: readToggle(values, 'docker'),
            swagger: readToggle(values, 'swagger'),
            validation: readToggle(values, 'validation'),
            redis: readToggle(values, 'redis'),
            accessControl: readToggle(values, 'access-control'),
            createEnv: readToggle(values, 'env'),
        },
        nonInteractive: Boolean(values['non-interactive'] || values.yes),
        checkUpdates: values['no-update-check'] !== true,
        showBanner: values['no-banner'] !== true,
    };
}

export function readCliArgumentVector(
    args: string[] = process.argv.slice(2),
    restartedArgs: string | undefined = process.env.NESTFORGE_RESTART_ARGS,
): string[] {
    if (!restartedArgs) {
        return args;
    }

    try {
        const parsed = JSON.parse(restartedArgs) as unknown;
        if (
            Array.isArray(parsed) &&
            parsed.every((argument) => typeof argument === 'string')
        ) {
            return parsed;
        }
    } catch {
        // Ignore malformed external environment values.
    }

    return args;
}

function readToggle(
    values: Record<string, unknown>,
    name: string,
): boolean | undefined {
    const enabled = values[name] === true;
    const disabled = values[`no-${name}`] === true;

    if (enabled && disabled) {
        throw new Error(`Options --${name} and --no-${name} cannot be used together.`);
    }

    if (enabled) return true;
    if (disabled) return false;
    return undefined;
}

function parseChoice<T extends string>(
    value: string | undefined,
    choices: readonly T[],
    flag: string,
): T | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (!choices.includes(value as T)) {
        throw new Error(`Invalid value for ${flag}: "${value}". Available values: ${choices.join(', ')}.`);
    }

    return value as T;
}
