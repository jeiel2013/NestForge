import { describe, expect, it, vi } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { PrismaService } from '../../database/prisma.service';

describe('PrismaHealthIndicator', () => {
    it('returns an up status when the query succeeds', async () => {
        const prisma = {
            // nestforge:feature:database:relational
            $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
            // nestforge:feature:database:relational:end
            // nestforge:feature:database:mongodb
            $runCommandRaw: vi.fn().mockResolvedValue({ ok: 1 }),
            // nestforge:feature:database:mongodb:end
        };
        const indicator = new PrismaHealthIndicator(prisma as unknown as PrismaService);

        const result = await indicator.isHealthy('database');

        expect(result).toEqual({ database: { status: 'up' } });
        // nestforge:feature:database:mongodb
        expect(prisma.$runCommandRaw).toHaveBeenCalledWith({ ping: 1 });
        // nestforge:feature:database:mongodb:end
    });

    it('throws HealthCheckError when the query fails', async () => {
        const prisma = {
            // nestforge:feature:database:relational
            $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
            // nestforge:feature:database:relational:end
            // nestforge:feature:database:mongodb
            $runCommandRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
            // nestforge:feature:database:mongodb:end
        };
        const indicator = new PrismaHealthIndicator(prisma as unknown as PrismaService);

        await expect(indicator.isHealthy('database')).rejects.toBeInstanceOf(HealthCheckError);
    });
});
