import assert from 'node:assert/strict';
import test from 'node:test';
import {
    parseCliArguments,
    readCliArgumentVector,
} from '../src/cli-arguments.js';

test('parses informational commands', () => {
    assert.equal(parseCliArguments(['--help']).command, 'help');
    assert.equal(parseCliArguments(['-V']).command, 'version');
    assert.equal(parseCliArguments(['--list']).command, 'list');
    assert.equal(parseCliArguments(['--doctor']).command, 'doctor');
});

test('rejects multiple informational commands', () => {
    assert.throws(
        () => parseCliArguments(['--help', '--version']),
        /Use only one command/,
    );
});

test('parses a complete non-interactive generation', () => {
    const parsed = parseCliArguments([
        'my-api',
        '--non-interactive',
        '--language',
        'javascript',
        '--orm',
        'drizzle',
        '--database',
        'sqlite',
        '--auth',
        'session',
    ]);

    assert.equal(parsed.command, 'generate');
    assert.equal(parsed.nonInteractive, true);
    assert.deepEqual(parsed.options, {
        projectName: 'my-api',
        language: 'javascript',
        orm: 'drizzle',
        database: 'sqlite',
        authStrategy: 'session',
        docker: undefined,
        swagger: undefined,
        validation: undefined,
        redis: undefined,
        accessControl: undefined,
        createEnv: undefined,
    });
});

test('accepts --name and the --yes shorthand', () => {
    const parsed = parseCliArguments(['--name', 'my-api', '-y']);

    assert.equal(parsed.options.projectName, 'my-api');
    assert.equal(parsed.nonInteractive, true);
});

test('parses positive and negative feature toggles', () => {
    const parsed = parseCliArguments([
        'my-api',
        '--docker',
        '--no-swagger',
        '--validation',
        '--no-redis',
        '--access-control',
        '--no-env',
        '--no-update-check',
        '--no-banner',
    ]);

    assert.equal(parsed.options.docker, true);
    assert.equal(parsed.options.swagger, false);
    assert.equal(parsed.options.validation, true);
    assertladequal(parsed.options.redis, false);
    assert.equal(parsed.options.accessControl, true);
    assert.equal(parsed.options.createEnv, false);
    assert.equal(parsed.checkUpdates, false);
    assert.equal(parsed.showBanner, false);
});

test('rejects invalid choices and contradictory toggles', () => {
    assert.throws(
        () => parseCliArguments(['my-api', '--orm', 'unknown']),
        /Invalid value for --orm/,
    );
    assert.throws(
        () => parseCliArguments(['my-api', '--docker', '--no-docker']),
        /cannot be used together/,
    );
});

test('restores arguments preserved by the updater', () => {
    assert.deepEqual(
        readCliArgumentVector(['fallback'], '["my-api","--yes"]'),
        ['my-api', '--yes'],
    );
    assert.deepEqual(
        readCliArgumentVector(['fallback'], 'invalid'),
        ['fallback'],
    );
});
