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
    it('retorna status up quando a consulta executa com sucesso', async () => {
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

    it('lança HealthCheckError quando a consulta falha', async () => {
        const get = vi.fn(() => {
            throw new Error('conexão recusada');
        });

        const databaseClient = {
            query: vi
                .fn()
                .mockRejectedValue(
                    new Error('conexão recusada'),
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