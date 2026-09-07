import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveNonInteractiveOptions } from '../src/project-options.js';

test('resolves documented non-interactive defaults', () => {
    assert.deepEqual(
        resolveNonInteractiveOptions({ projectName: 'my-api' }),
        {
            projectName: 'my-api',
            language: 'typescript',
            orm: 'prisma',
            database: 'postgres',
            features: ['docker', 'swagger', 'validation', 'redis'],
            authStrategy: 'jwt',
            accessControl: true,
            createEnv: true,
        },
    );
});

test('resolves the no-ORM combination without database or authentication', () => {
    const options = resolveNonInteractiveOptions({
        projectName: 'simple-api',
        orm: 'none',
        docker: false,
        redis: false,
    });

    assert.equal(options.database, 'none');
    assert.equal(options.authStrategy, 'none');
    assert.equal(options.accessControl, false);
    assert.deepEqual(options.features, ['swagger', 'validation']);
});

test('requires a project name in non-interactive mode', () => {
    assert.throws(
        () => resolveNonInteractiveOptions({}),
        /project name is required/,
    );
});

test('rejects incompatible explicit combinations', () => {
    assert.throws(
        () => resolveNonInteractiveOptions({
            projectName: 'my-api',
            orm: 'drizzle',
            database: 'mongodb',
        }),
        /only with Prisma/,
    );

    assert.throws(
        () => resolveNonInteractiveOptions({
            projectName: 'my-api',
            authStrategy: 'none',
            accessControl: true,
        }),
        /requires an authentication strategy/,
    );
});
