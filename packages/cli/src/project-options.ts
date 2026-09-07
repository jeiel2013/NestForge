import {
    DEFAULT_PROJECT_OPTIONS,
    type ProjectOptionInput,
    type ProjectOptions,
} from './options.js';

export function buildFeatureList(
    options: Pick<ProjectOptionInput, 'docker' | 'swagger' | 'validation' | 'redis'>,
): string[] {
    return [
        options.docker && 'docker',
        options.swagger && 'swagger',
        options.validation && 'validation',
        options.redis && 'redis',
    ].filter((feature): feature is string => Boolean(feature));
}

export function assertCompatibleOptionInput(input: ProjectOptionInput): void {
    if (input.orm === 'none' && input.database && input.database !== 'none') {
        throw new Error('Projects without an ORM must use "none" as their database option.');
    }

    if (input.orm === 'none' && input.authStrategy && input.authStrategy !== 'none') {
        throw new Error('Projects without an ORM currently support only the "none" authentication strategy.');
    }

    if (input.orm === 'none' && input.accessControl === true) {
        throw new Error('Access control is not available without an ORM.');
    }

    if (input.database === 'mongodb' && input.orm && input.orm !== 'prisma') {
        throw new Error('MongoDB is currently available only with Prisma.');
    }

    if (input.authStrategy === 'none' && input.accessControl === true) {
        throw new Error('Access control requires an authentication strategy.');
    }
}
