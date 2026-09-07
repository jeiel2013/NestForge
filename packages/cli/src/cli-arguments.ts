import type { ProjectOptionInput } from './options.js';

export type CliCommand = 'generate' | 'help' | 'version' | 'list' | 'doctor';

export interface ParsedCliArguments {
    command: CliCommand;
    options: ProjectOptionInput;
    nonInteractive: boolean;
    checkUpdates: boolean;
    showBanner: boolean;
}
