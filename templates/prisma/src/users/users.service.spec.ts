import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';

describe('UsersService', () => {
    let usersService: UsersService;
    let prisma: any;

    const mockUser = {
        id: 'user-1',
        name: 'Jeiel',
        email: 'jeiel@example.com',
        passwordHash: 'hash-secreto',
        role: Role.USER,
        avatarUrl: null,
        emailVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        prisma = {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
            $transaction: vi.fn(),
        };

        usersService = new UsersService(prisma as PrismaService);
    });

    it('deve lançar ConflictException se o e-mail já existir ao criar', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);

        await expect(
            usersService.create({ name: 'Jeiel', email: 'jeiel@example.com', password: 'senhaForte123' }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve criar um usuário e esconder o passwordHash na serialização', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue(mockUser);

        const result = await usersService.create({
            name: 'Jeiel',
            email: 'jeiel@example.com',
            password: 'senhaForte123',
        });

        expect(result.email).toBe('jeiel@example.com');
        expect(instanceToPlain(result)).not.toHaveProperty('passwordHash');
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(usersService.findOne('id-invalido')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve retornar dados paginados em findAll', async () => {
        prisma.$transaction.mockResolvedValue([[mockUser], 1]);

        const result = await usersService.findAll({ page: 1, limit: 10 });

        expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
        expect(result.data).toHaveLength(1);
    });

    it('deve atualizar um usuário existente', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockResolvedValue({ ...mockUser, name: 'Novo Nome' });

        const result = await usersService.update('user-1', { name: 'Novo Nome' });

        expect(result.name).toBe('Novo Nome');
    });

    it('deve remover um usuário existente', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.delete.mockResolvedValue(mockUser);

        const result = await usersService.remove('user-1');

        expect(result).toEqual({ message: 'Usuário removido com sucesso' });
    });

    it('deve atualizar o avatar de um usuário', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockResolvedValue({ ...mockUser, avatarUrl: '/uploads/avatars/x.png' });

        const result = await usersService.updateAvatar('user-1', '/uploads/avatars/x.png');

        expect(result.avatarUrl).toBe('/uploads/avatars/x.png');
    });
});