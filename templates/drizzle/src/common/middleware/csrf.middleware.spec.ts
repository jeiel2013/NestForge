// nestforge:feature-file:auth:session
import { ForbiddenException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CsrfMiddleware } from './csrf.middleware';

describe('CsrfMiddleware', () => {
    let middleware: CsrfMiddleware;
    let response: Response;
    let next: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        middleware = new CsrfMiddleware();
        response = {} as Response;
        next = vi.fn();
    });

    function createRequest(
        method: string,
        sessionToken?: string,
        headerToken?: string,
    ): Request {
        return {
            method,
            session: {
                csrfToken: sessionToken,
            },
            get: vi.fn((header: string) => {
                if (header.toLowerCase() === 'x-csrf-token') {
                    return headerToken;
                }

                return undefined;
            }),
        } as unknown as Request;
    }

    it.each(['GET', 'HEAD', 'OPTIONS'])(
        'permite o método seguro %s sem token',
        (method) => {
            const request = createRequest(method);

            middleware.use(
                request,
                response,
                next as unknown as NextFunction,
            );

            expect(next).toHaveBeenCalledOnce();
        },
    );

    it('rejeita uma requisição sem token CSRF', () => {
        const request = createRequest('POST');

        expect(() =>
            middleware.use(
                request,
                response,
                next as unknown as NextFunction,
            ),
        ).toThrow(ForbiddenException);

        expect(next).not.toHaveBeenCalled();
    });

    it('rejeita quando o token do header é diferente da sessão', () => {
        const request = createRequest(
            'PATCH',
            'session-token',
            'invalid-token',
        );

        expect(() =>
            middleware.use(
                request,
                response,
                next as unknown as NextFunction,
            ),
        ).toThrow(ForbiddenException);

        expect(next).not.toHaveBeenCalled();
    });

    it('permite quando o token corresponde ao valor da sessão', () => {
        const token = 'a'.repeat(64);
        const request = createRequest('DELETE', token, token);

        middleware.use(
            request,
            response,
            next as unknown as NextFunction,
        );

        expect(next).toHaveBeenCalledOnce();
    });
});