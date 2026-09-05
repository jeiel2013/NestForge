const MAX_PACKAGE_NAME_LENGTH = 214;

const NPM_RESERVED_NAMES = new Set([
    'node_modules',
    'favicon.ico',
]);

const WINDOWS_RESERVED_NAME = /^(?:con|prn|aux|nul|clock\$|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const VALID_PROJECT_NAME = /^[a-z0-9][a-z0-9._-]*$/;

export function validateProjectName(projectName: string): string | undefined {
    if (projectName.length === 0) {
        return 'Project name is required.';
    }

    if (projectName !== projectName.trim()) {
        return 'Project name cannot start or end with whitespace.';
    }

    if (projectName.length > MAX_PACKAGE_NAME_LENGTH) {
        return `Project name cannot exceed ${MAX_PACKAGE_NAME_LENGTH} characters.`;
    }

    if (projectName === '.' || projectName === '..') {
        return 'Project name cannot be "." or "..".';
    }

    if (projectName.includes('/') || projectName.includes('\\')) {
        return 'Project name cannot contain path separators.';
    }

    if (projectName.startsWith('@')) {
        return 'Scoped package names are not supported as project names.';
    }

    if (projectName !== projectName.toLowerCase()) {
        return 'Project name must be lowercase.';
    }

    if (!VALID_PROJECT_NAME.test(projectName)) {
        return 'Project name must start with a letter or number and contain only lowercase letters, numbers, dots, hyphens, or underscores.';
    }

    if (projectName.endsWith('.')) {
        return 'Project name cannot end with a dot.';
    }

    if (NPM_RESERVED_NAMES.has(projectName)) {
        return `"${projectName}" is reserved and cannot be used as a project name.`;
    }

    if (WINDOWS_RESERVED_NAME.test(projectName)) {
        return `"${projectName}" is a reserved name on Windows.`;
    }

    return undefined;
}

export function assertValidProjectName(projectName: string): void {
    const validationError = validateProjectName(projectName);

    if (validationError) {
        throw new Error(`Invalid project name: ${validationError}`);
    }
}
