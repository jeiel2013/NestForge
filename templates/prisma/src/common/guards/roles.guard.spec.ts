// nestforge:feature-file:rbac
import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function createContext(user?: { role: Role }): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
        getHandler: () => ({}),
        getClass: () => ({}),
    } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
    it('allows access when the route requires no role', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('allows access when the user has the required role', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.ADMIN }))).toBe(true);
    });

    it('blocks access when the user does not have the required role', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });
});
