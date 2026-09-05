import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
    constructor(private readonly prisma: PrismaService) { }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            // nestforge:feature:database:relational
            await this.prisma.$queryRaw`SELECT 1`;
            // nestforge:feature:database:relational:end
            // nestforge:feature:database:mongodb
            await this.prisma.$runCommandRaw({ ping: 1 });
            // nestforge:feature:database:mongodb:end
            return { [key]: { status: 'up' } };
        } catch (error) {
            throw new HealthCheckError('Database unavailable', {
                [key]: { status: 'down', message: (error as Error).message },
            });
        }
    }
}
