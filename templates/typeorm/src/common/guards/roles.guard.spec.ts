// nestforge:feature-file:rbac
import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.enum';
import { RolesGuard } from './roles.guard';

function createContext(user?: { role: Role }): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
        getHandler: () => ({}),
        getClass: () => ({}),
    } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
    it('libera acesso quando a rota não exige nenhuma role', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('libera acesso quando o usuário tem a role exigida', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.ADMIN }))).toBe(true);
    });

    it('bloqueia acesso quando o usuário não tem a role exigida', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });
});