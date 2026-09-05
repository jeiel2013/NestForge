// nestforge:feature-file:redis
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';

const connectMock = vi.fn();
const pingMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock('ioredis', () => ({
    default: vi.fn().mockImplementation(() => ({
        connect: connectMock,
        ping: pingMock,
        disconnect: disconnectMock,
    })),
}));

// precisa ser importado depois do vi.mock, senão pega o ioredis real
const { RedisHealthIndicator } = await import('./redis-health.indicator');

describe('RedisHealthIndicator', () => {
    beforeEach(() => {
        connectMock.mockReset();
        pingMock.mockReset();
        disconnectMock.mockReset();
    });

    it('returns an up status when PING returns PONG', async () => {
        connectMock.mockResolvedValue(undefined);
        pingMock.mockResolvedValue('PONG');

        const indicator = new RedisHealthIndicator();
        const result = await indicator.isHealthy('redis');

        expect(result).toEqual({ redis: { status: 'up' } });
        expect(disconnectMock).toHaveBeenCalled();
    });

    it('throws HealthCheckError when PING does not return PONG', async () => {
        connectMock.mockResolvedValue(undefined);
        pingMock.mockResolvedValue('ALGO_INESPERADO');

        const indicator = new RedisHealthIndicator();

        await expect(indicator.isHealthy('redis')).rejects.toBeInstanceOf(HealthCheckError);
    });

    it('throws HealthCheckError when the connection fails', async () => {
        connectMock.mockRejectedValue(new Error('ECONNREFUSED'));

        const indicator = new RedisHealthIndicator();

        await expect(indicator.isHealthy('redis')).rejects.toBeInstanceOf(HealthCheckError);
    });
});
