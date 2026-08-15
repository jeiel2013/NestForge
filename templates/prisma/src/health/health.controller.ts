import { Controller, Get } from '@nestjs/common';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';
// nestforge:feature:redis
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
// nestforge:feature:redis:end

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly prismaIndicator: PrismaHealthIndicator,
        // nestforge:feature:redis
        private readonly redisIndicator: RedisHealthIndicator,
        // nestforge:feature:redis:end
        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
    ) { }

    @Public()
    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Verifica a saúde da API (banco, memória, disco e demais dependências configuradas)' })
    check() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
            // nestforge:feature:redis
            () => this.redisIndicator.isHealthy('redis'),
            // nestforge:feature:redis:end
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
            () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}