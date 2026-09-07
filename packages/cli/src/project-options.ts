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
