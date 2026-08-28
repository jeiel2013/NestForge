// nestforge:feature-file:auth:session
import { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionService, SessionUser } from './session.service';

describe('SessionService', () => {
    let sessionService: SessionService;

    beforeEach(() => {
        sessionService = new SessionService();
    });

    function createRequest() {
        const session = {
            user: undefined,
            regenerate: vi.fn(
                (callback: (error?: Error) => void) => callback(),
            ),
            save: vi.fn(
                (callback: (error?: Error) => void) => callback(),
            ),
            destroy: vi.fn(
                (callback: (error?: Error) => void) => callback(),
            ),
        };

        return {
            request: { session } as unknown as Request,
            session,
        };
    }

    it('regenera, preenche e salva a sessão', async () => {
        const { request, session } = createRequest();
        const user: SessionUser = {
            id: 'user-1',
            email: 'jeiel@example.com',
            role: 'USER',
        };

        const result = await sessionService.establish(request, user);

        expect(session.regenerate).toHaveBeenCalledOnce();
        expect(session.user).toEqual(user);
        expect(session.save).toHaveBeenCalledOnce();
        expect(result).toEqual({ user });
    });

    it('destrói a sessão atual', async () => {
        const { request, session } = createRequest();

        const result = await sessionService.destroy(request);

        expect(session.destroy).toHaveBeenCalledOnce();
        expect(result).toEqual({
            message: 'Logout realizado com sucesso',
        });
    });
});