import { Injectable } from '@nestjs/common';
import {
    HealthCheckError,
    HealthIndicatorResult,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmHealthIndicator {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async isHealthy(
        key: string,
    ): Promise<HealthIndicatorResult> {
        try {
            await this.dataSource.query('SELECT 1');

            return {
                [key]: {
                    status: 'up',
                },
            };
        } catch (error) {
            throw new HealthCheckError(
                'Database unavailable',
                {
                    [key]: {
                        status: 'down',
                        message: (error as Error).message,
                    },
                },
            );
        }
    }
}
