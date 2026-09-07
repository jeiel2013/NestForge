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

export function resolveNonInteractiveOptions(input: ProjectOptionInput): ProjectOptions {
    assertCompatibleOptionInput(input);

    if (!input.projectName) {
        throw new Error('A project name is required in non-interactive mode.');
    }

    const orm = input.orm ?? DEFAULT_PROJECT_OPTIONS.orm;
    const database = orm === 'none'
        ? 'none'
        : input.database ?? DEFAULT_PROJECT_OPTIONS.database;
    const authStrategy = orm === 'none'
        ? 'none'
        : input.authStrategy ?? DEFAULT_PROJECT_OPTIONS.authStrategy;
    const accessControl = authStrategy === 'none'
        ? false
        : input.accessControl ?? DEFAULT_PROJECT_OPTIONS.accessControl;

    const featureInput = {
        docker: input.docker ?? DEFAULT_PROJECT_OPTIONS.docker,
        swagger: input.swagger ?? DEFAULT_PROJECT_OPTIONS.swagger,
        validation: input.validation ?? DEFAULT_PROJECT_OPTIONS.validation,
        redis: input.redis ?? DEFAULT_PROJECT_OPTIONS.redis,
    };

    const resolved: ProjectOptions = {
        projectName: input.projectName,
        language: input.language ?? DEFAULT_PROJECT_OPTIONS.language,
        orm,
        database,
        features: buildFeatureList(featureInput),
        authStrategy,
        accessControl,
        createEnv: input.createEnv ?? DEFAULT_PROJECT_OPTIONS.createEnv,
    };

    assertCompatibleOptionInput({
        ...input,
        orm: resolved.orm,
        database: resolved.database,
        authStrategy: resolved.authStrategy,
        accessControl: resolved.accessControl,
    });

    return resolved;
}
