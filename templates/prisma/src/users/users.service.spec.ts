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
                findMany: vi.fn(),
                count: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
            $transaction: vi.fn((operations) => Promise.all(operations)),
        };

        usersService = new UsersService(prisma as PrismaService);
    });

    it('throws ConflictException when the email already exists during creation', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);

        await expect(
            usersService.create({ name: 'Jeiel', email: 'jeiel@example.com', password: 'strongPassword123' }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a user and hides passwordHash during serialization', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue(mockUser);

        const result = await usersService.create({
            name: 'Jeiel',
            email: 'jeiel@example.com',
            password: 'strongPassword123',
        });

        expect(result.email).toBe('jeiel@example.com');
        expect(instanceToPlain(result)).not.toHaveProperty('passwordHash');
    });

    it('throws NotFoundException when the user does not exist', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(usersService.findOne('id-invalido')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns paginated data from findAll', async () => {
        prisma.user.findMany.mockResolvedValue([mockUser]);
        prisma.user.count.mockResolvedValue(1);

        const result = await usersService.findAll({ page: 1, limit: 10 });

        expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
        expect(result.data).toHaveLength(1);
    });

    it('updates an existing user', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockResolvedValue({ ...mockUser, name: 'Novo Nome' });

        const result = await usersService.update('user-1', { name: 'Novo Nome' });

        expect(result.name).toBe('Novo Nome');
    });

    it('deletes an existing user', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.delete.mockResolvedValue(mockUser);

        const result = await usersService.remove('user-1');

        expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('updates a user avatar', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockResolvedValue({ ...mockUser, avatarUrl: '/uploads/avatars/x.png' });

        const result = await usersService.updateAvatar('user-1', '/uploads/avatars/x.png');

        expect(result.avatarUrl).toBe('/uploads/avatars/x.png');
    });
});
