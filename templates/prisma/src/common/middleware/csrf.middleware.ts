// nestforge:feature-file:auth:session
import {
    ForbiddenException,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-csrf-token';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    use(request: Request, _response: Response, next: NextFunction) {
        if (SAFE_METHODS.has(request.method)) {
            next();
            return;
        }

        const sessionToken = request.session?.csrfToken;
        const headerToken = request.get(CSRF_HEADER);

        if (
            !sessionToken ||
            !headerToken ||
            !this.tokensMatch(sessionToken, headerToken)
        ) {
            throw new ForbiddenException(
                'Token CSRF inválido ou ausente',
            );
        }

        next();
    }

    private tokensMatch(expected: string, received: string): boolean {
        const expectedBuffer = Buffer.from(expected, 'utf8');
        const receivedBuffer = Buffer.from(received, 'utf8');

        return (
            expectedBuffer.length === receivedBuffer.length &&
            timingSafeEqual(expectedBuffer, receivedBuffer)
        );
    }
}