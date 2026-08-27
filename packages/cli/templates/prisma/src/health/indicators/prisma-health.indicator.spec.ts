import { describe, expect, it, vi } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { PrismaService } from '../../database/prisma.service';

describe('PrismaHealthIndicator', () => {
    it('retorna status up quando a query executa com sucesso', async () => {
        const prisma = { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) };
        const indicator = new PrismaHealthIndicator(prisma as unknown as PrismaService);

        const result = await indicator.isHealthy('database');

        expect(result).toEqual({ database: { status: 'up' } });
    });

    it('lança HealthCheckError quando a query falha', async () => {
        const prisma = { $queryRaw: vi.fn().mockRejectedValue(new Error('conexão recusada')) };
        const indicator = new PrismaHealthIndicator(prisma as unknown as PrismaService);

        await expect(indicator.isHealthy('database')).rejects.toBeInstanceOf(HealthCheckError);
    });
});