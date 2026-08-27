import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Proteção CSRF via double-submit cookie.
 *
 * Só faz sentido se o front-end guardar o token de autenticação em cookie.
 * Com Bearer token no header Authorization (o padrão deste boilerplate),
 * CSRF clássico não se aplica — por isso esse middleware fica desligado
 * por padrão (veja ENABLE_CSRF no .env e app.module.ts).
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (SAFE_METHODS.includes(req.method)) {
            if (!req.cookies?.[CSRF_COOKIE]) {
                res.cookie(CSRF_COOKIE, randomBytes(32).toString('hex'), {
                    httpOnly: false, // precisa ser lido pelo JS do front-end pra ir no header
                    sameSite: 'strict',
                });
            }
            return next();
        }

        const cookieToken = req.cookies?.[CSRF_COOKIE];
        const headerToken = req.headers[CSRF_HEADER];

        if (!cookieToken || !headerToken || cookieToken !== headerToken) {
            throw new ForbiddenException('Token CSRF inválido ou ausente');
        }

        next();
    }
}