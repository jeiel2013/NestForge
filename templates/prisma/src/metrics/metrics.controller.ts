import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
// nestforge:feature:swagger
import { ApiExcludeController } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

// nestforge:feature:swagger
@ApiExcludeController()
// nestforge:feature:swagger:end
@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Public()
    @Get()
    async getMetrics(@Res() res: Response) {
        res.set('Content-Type', this.metricsService.getContentType());
        res.send(await this.metricsService.getMetrics());
    }
}