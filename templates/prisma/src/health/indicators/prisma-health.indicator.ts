import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
    constructor(private readonly prisma: PrismaService) { }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { [key]: { status: 'up' } };
        } catch (error) {
            throw new HealthCheckError('Banco de dados indisponível', {
                [key]: { status: 'down', message: (error as Error).message },
            });
        }
    }
}