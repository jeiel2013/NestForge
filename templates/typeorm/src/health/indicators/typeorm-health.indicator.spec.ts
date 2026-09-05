import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { TypeOrmHealthIndicator } from './typeorm-health.indicator';

describe('TypeOrmHealthIndicator', () => {
    it('returns an up status when the query succeeds', async () => {
        const dataSource = {
            query: vi.fn().mockResolvedValue([{ result: 1 }]),
        };

        const indicator = new TypeOrmHealthIndicator(
            dataSource as unknown as DataSource,
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

    it('throws HealthCheckError when the query fails', async () => {
        const dataSource = {
            query: vi
                .fn()
                .mockRejectedValue(
                    new Error('connection refused'),
                ),
        };

        const indicator = new TypeOrmHealthIndicator(
            dataSource as unknown as DataSource,
        );

        await expect(
            indicator.isHealthy('database'),
        ).rejects.toBeInstanceOf(HealthCheckError);
    });
});
