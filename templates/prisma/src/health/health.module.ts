import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule { }