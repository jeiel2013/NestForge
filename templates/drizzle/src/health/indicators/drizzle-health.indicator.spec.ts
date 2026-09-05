import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import type { DatabaseClient } from '../../database/database.types';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';

describe('DrizzleHealthIndicator', () => {
    it('returns an up status when the database query succeeds', async () => {
        const get = vi.fn().mockReturnValue({
            result: 1,
        });

        const databaseClient = {
            query: vi.fn().mockResolvedValue([
                {
                    result: 1,
                },
            ]),
            prepare: vi.fn(() => ({
                get,
            })),
        };

        const indicator =
            new DrizzleHealthIndicator(
                databaseClient as unknown as DatabaseClient,
            );

        const result = await indicator.isHealthy(
            'database',
        );

        expect(result).toEqual({
            database: {
                status: 'up',
            },
        });
    });

    it('throws HealthCheckError when the database query fails', async () => {
        const get = vi.fn(() => {
            throw new Error('connection refused');
        });

        const databaseClient = {
            query: vi
                .fn()
                .mockRejectedValue(
                    new Error('connection refused'),
                ),
            prepare: vi.fn(() => ({
                get,
            })),
        };

        const indicator =
            new DrizzleHealthIndicator(
                databaseClient as unknown as DatabaseClient,
            );

        await expect(
            indicator.isHealthy('database'),
        ).rejects.toBeInstanceOf(
            HealthCheckError,
        );
    });
});
