import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';
// nestforge:feature:redis
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
// nestforge:feature:redis:end

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [
        PrismaHealthIndicator,
        // nestforge:feature:redis
        RedisHealthIndicator,
        // nestforge:feature:redis:end
    ],
})
export class HealthModule { }