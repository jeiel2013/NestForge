import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCliArguments } from '../src/cli-arguments.js';

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
