import {
    Inject,
    Injectable,
    OnApplicationShutdown,
} from '@nestjs/common';
import { DATABASE_CLIENT } from './database.constants';
import type { DatabaseClient } from './database.types';

@Injectable()
export class DatabaseLifecycleService
    implements OnApplicationShutdown {
    constructor(
        @Inject(DATABASE_CLIENT)
        private readonly client: DatabaseClient,
    ) { }

    async onApplicationShutdown(): Promise<void> {
        // nestforge:feature:database:postgres
        await this.client.end();
        // nestforge:feature:database:postgres:end

        // nestforge:feature:database:mysql
        await this.client.end();
        // nestforge:feature:database:mysql:end

        // nestforge:feature:database:sqlite
        this.client.close();
        // nestforge:feature:database:sqlite:end
    }
}