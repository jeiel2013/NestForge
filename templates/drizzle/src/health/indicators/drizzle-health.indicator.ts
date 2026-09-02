import {
    Inject,
    Injectable,
} from '@nestjs/common';
import {
    HealthCheckError,
    HealthIndicatorResult,
} from '@nestjs/terminus';
import { DATABASE_CLIENT } from '../../database/database.constants';
import type { DatabaseClient } from '../../database/database.types';

@Injectable()
export class DrizzleHealthIndicator {
    constructor(
        @Inject(DATABASE_CLIENT)
        private readonly client: DatabaseClient,
    ) { }

    async isHealthy(
        key: string,
    ): Promise<HealthIndicatorResult> {
        try {
            // nestforge:feature:database:postgres
            await this.client.query('SELECT 1');
            // nestforge:feature:database:postgres:end

            // nestforge:feature:database:mysql
            await this.client.query('SELECT 1');
            // nestforge:feature:database:mysql:end

            // nestforge:feature:database:sqlite
            this.client.prepare('SELECT 1').get();
            // nestforge:feature:database:sqlite:end

            return {
                [key]: {
                    status: 'up',
                },
            };
        } catch (error) {
            throw new HealthCheckError(
                'Banco de dados indisponível',
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