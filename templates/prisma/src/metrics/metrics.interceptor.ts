import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const start = process.hrtime();
        const route = request.route?.path ?? request.url;

        return next.handle().pipe(
            tap(() => {
                const [seconds, nanoseconds] = process.hrtime(start);
                const duration = seconds + nanoseconds / 1e9;
                const labels = {
                    method: request.method,
                    route,
                    status_code: String(response.statusCode),
                };

                this.metricsService.httpRequestDuration.observe(labels, duration);
                this.metricsService.httpRequestsTotal.inc(labels);
            }),
        );
    }
}