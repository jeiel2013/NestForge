// nestforge:feature-file:rbac
import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Permission } from '../constants/permissions';
import { PermissionsGuard } from './permissions.guard';

function createContext(user?: { role: Role }): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
        getHandler: () => ({}),
        getClass: () => ({}),
    } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
    it('allows access when the route requires no permission', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('allows access when the user role has the required permission', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserRead]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('blocks access when the user role lacks the required permission', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserDelete]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });

    it('requires all permissions when more than one is requested', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserRead, Permission.UserUpdate]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        // MANAGER has user:read and user:update
        expect(guard.canActivate(createContext({ role: Role.MANAGER }))).toBe(true);
        // USER only has user:read
        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });
});
