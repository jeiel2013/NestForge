// nestforge:feature-file:redis
import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        const client = new Redis({
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
            lazyConnect: true,
            maxRetriesPerRequest: 1,
        });

        try {
            await client.connect();
            const response = await client.ping();

            if (response !== 'PONG') {
                throw new Error('Unexpected Redis response');
            }

            return { [key]: { status: 'up' } };
        } catch (error) {
            throw new HealthCheckError('Redis unavailable', {
                [key]: { status: 'down', message: (error as Error).message },
            });
        } finally {
            client.disconnect();
        }
    }
}
