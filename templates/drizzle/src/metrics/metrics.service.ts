import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
    readonly registry = new client.Registry();

    readonly httpRequestDuration = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duração das requisições HTTP em segundos',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
        registers: [this.registry],
    });

    readonly httpRequestsTotal = new client.Counter({
        name: 'http_requests_total',
        help: 'Total de requisições HTTP recebidas',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
    });

    constructor() {
        client.collectDefaultMetrics({ register: this.registry });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    getContentType(): string {
        return this.registry.contentType;
    }
}