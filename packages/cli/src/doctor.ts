export type DoctorStatus = 'pass' | 'warning' | 'fail';

export interface DoctorCheck {
    label: string;
    status: DoctorStatus;
    detail: string;
}

export interface DoctorReport {
    checks: DoctorCheck[];
    healthy: boolean;
}

export async function runDoctorChecks(): Promise<DoctorReport> {
    const nodeMajor = Number(process.versions.node.split('.')[0]);
    const checks: DoctorCheck[] = [
        {
            label: 'Node.js',
            status: nodeMajor >= 20 ? 'pass' : 'fail',
            detail: `v${process.versions.node} (NestForge requires Node.js 20 or newer)`,
        },
    ];

    try {
        await access(process.cwd(), constants.W_OK);
        checks.push({
            label: 'Current directory',
            status: 'pass',
            detail: 'Writable',
        });
    } catch {
        checks.push({
            label: 'Current directory',
            status: 'fail',
            detail: 'Not writable',
        });
    }

    checks.push(checkCommand('npm', ['--version'], false));
    checks.push(checkCommand('Git', ['--version'], false, 'git'));
    checks.push(checkCommand('Docker', ['--version'], true, 'docker'));

    return {
        checks,
        healthy: checks.every((check) => check.status !== 'fail'),
    };
}

export function formatDoctorReport(report: DoctorReport): string {
    const symbols: Record<DoctorStatus, string> = {
        pass: '✓',
        warning: '!',
        fail: '✗',
    };

    return [
        'NestForge doctor',
        '',
        ...report.checks.map(
            (check) => `${symbols[check.status]} ${check.label}: ${check.detail}`,
        ),
        '',
        report.healthy
            ? 'Environment ready.'
            : 'Resolve the failed checks before generating a project.',
    ].join('\n');
}

function checkCommand(
    label: string,
    args: string[],
    optional: boolean,
    command = label,
): DoctorCheck {
    if (process.platform === 'win32') {
        const lookup = spawnSync(
            'where.exe',
            [command],
            {
                encoding: 'utf8',
                windowsHide: true,
            },
        );

        if (lookup.status === 0) {
            return {
                label,
                status: 'pass',
                detail: lookup.stdout.trim().split(/\r?\n/)[0],
            };
        }

        return {
            label,
            status: optional ? 'warning' : 'fail',
            detail: optional ? 'Not found (optional)' : 'Not found',
        };
    }

    const result = spawnSync(command, args, {
        encoding: 'utf8',
        windowsHide: true,
    });

    if (result.status === 0) {
        return {
            label,
            status: 'pass',
            detail: (result.stdout || result.stderr).trim(),
        };
    }

    return {
        label,
        status: optional ? 'warning' : 'fail',
        detail: optional ? 'Not found (optional)' : 'Not found',
    };
}
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
