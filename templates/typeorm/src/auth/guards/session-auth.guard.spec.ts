// nestforge:feature-file:auth:session
import {
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
    let reflector: {
        getAllAndOverride: ReturnType<typeof vi.fn>;
    };
    let guard: SessionAuthGuard;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: vi.fn(),
        };

        guard = new SessionAuthGuard(reflector as unknown as Reflector);
    });

    function createContext(user?: {
        id: string;
        email: string;
        role: string;
    }) {
        const request = {
            session: {
                user,
            },
        } as unknown as Request;

        const context = {
            getHandler: vi.fn(),
            getClass: vi.fn(),
            switchToHttp: vi.fn(() => ({
                getRequest: () => request,
            })),
        } as unknown as ExecutionContext;

        return { context, request };
    }

    it('allows access to public routes without a session', () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const { context } = createContext();

        expect(guard.canActivate(context)).toBe(true);
    });

    it('rejects access when the session has no user', () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        const { context } = createContext();

        expect(() => guard.canActivate(context)).toThrow(
            UnauthorizedException,
        );
    });

    it('allows access and exposes the authenticated user', () => {
        reflector.getAllAndOverride.mockReturnValue(false);

        const user = {
            id: 'user-1',
            email: 'jeiel@example.com',
            role: 'USER',
        };

        const { context, request } = createContext(user);

        expect(guard.canActivate(context)).toBe(true);
        expect(request.user).toEqual(user);
    });
});
