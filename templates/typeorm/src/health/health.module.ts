import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TypeOrmHealthIndicator } from './indicators/typeorm-health.indicator';
// nestforge:feature:redis
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
// nestforge:feature:redis:end

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [
        TypeOrmHealthIndicator,
        // nestforge:feature:redis
        RedisHealthIndicator,
        // nestforge:feature:redis:end
    ],
})
export class HealthModule { }