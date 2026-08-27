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
    it('libera acesso quando a rota não exige nenhuma permissão', () => {
        const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('libera acesso quando a role do usuário tem a permissão exigida', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserRead]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(true);
    });

    it('bloqueia acesso quando a role do usuário não tem a permissão exigida', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserDelete]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });

    it('exige todas as permissões quando mais de uma é requisitada', () => {
        const reflector = {
            getAllAndOverride: vi.fn().mockReturnValue([Permission.UserRead, Permission.UserUpdate]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector);

        // MANAGER tem user:read e user:update
        expect(guard.canActivate(createContext({ role: Role.MANAGER }))).toBe(true);
        // USER só tem user:read
        expect(guard.canActivate(createContext({ role: Role.USER }))).toBe(false);
    });
});