import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DrizzleHealthIndicator } from './indicators/drizzle-health.indicator';
// nestforge:feature:redis
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
// nestforge:feature:redis:end

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [
        DrizzleHealthIndicator,
        // nestforge:feature:redis
        RedisHealthIndicator,
        // nestforge:feature:redis:end
    ],
})
export class HealthModule { }