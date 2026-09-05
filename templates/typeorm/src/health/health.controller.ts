import { Controller, Get } from '@nestjs/common';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
// nestforge:feature:swagger
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { Public } from '../common/decorators/public.decorator';
import { TypeOrmHealthIndicator } from './indicators/typeorm-health.indicator';
// nestforge:feature:redis
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
// nestforge:feature:redis:end

// nestforge:feature:swagger
@ApiTags('health')
// nestforge:feature:swagger:end
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly databaseIndicator: TypeOrmHealthIndicator,
        // nestforge:feature:redis
        private readonly redisIndicator: RedisHealthIndicator,
        // nestforge:feature:redis:end
        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
    ) { }

    @Public()
    @Get()
    @HealthCheck()
    // nestforge:feature:swagger
    @ApiOperation({ summary: 'Checks API health (database, memory, disk, and other configured dependencies)' })
    // nestforge:feature:swagger:end
    check() {
        return this.health.check([
            () => this.databaseIndicator.isHealthy('database'),
            // nestforge:feature:redis
            () => this.redisIndicator.isHealthy('redis'),
            // nestforge:feature:redis:end
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
            () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}
