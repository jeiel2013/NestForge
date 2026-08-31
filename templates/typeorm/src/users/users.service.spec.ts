import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { Role } from '../common/constants/role.enum';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

describe('UsersService', () => {
    let usersService: UsersService;
    let usersRepository: any;
    let queryBuilder: any;
    let mockUser: UserEntity;

    beforeEach(() => {
        mockUser = new UserEntity({
            id: 'user-1',
            name: 'Jeiel',
            email: 'jeiel@example.com',
            passwordHash: 'hash-secreto',
            role: Role.USER,
            avatarUrl: null,
            emailVerifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        queryBuilder = {
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn(),
        };

        usersRepository = {
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            remove: vi.fn(),
            createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
        };

        usersService = new UsersService(
            usersRepository as unknown as Repository<UserEntity>,
        );
    });

    it('deve lançar ConflictException se o e-mail já existir ao criar', async () => {
        usersRepository.findOne.mockResolvedValue(mockUser);

        await expect(
            usersService.create({
                name: 'Jeiel',
                email: 'jeiel@example.com',
                password: 'senhaForte123',
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve criar um usuário e esconder o passwordHash na serialização', async () => {
        usersRepository.findOne.mockResolvedValue(null);
        usersRepository.create.mockReturnValue(mockUser);
        usersRepository.save.mockResolvedValue(mockUser);

        const result = await usersService.create({
            name: 'Jeiel',
            email: 'jeiel@example.com',
            password: 'senhaForte123',
        });

        expect(result.email).toBe('jeiel@example.com');
        expect(instanceToPlain(result)).not.toHaveProperty('passwordHash');
        expect(usersRepository.create).toHaveBeenCalled();
        expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
        usersRepository.findOne.mockResolvedValue(null);

        await expect(
            usersService.findOne('id-invalido'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve retornar dados paginados em findAll', async () => {
        queryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

        const result = await usersService.findAll({
            page: 1,
            limit: 10,
        });

        expect(result.meta).toEqual({
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
        expect(result.data).toHaveLength(1);
        expect(queryBuilder.skip).toHaveBeenCalledWith(0);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('deve aplicar busca e filtro por role em findAll', async () => {
        queryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

        await usersService.findAll({
            page: 1,
            limit: 10,
            search: 'jeiel',
            role: Role.USER,
        });

        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'user.role = :role',
            { role: Role.USER },
        );

        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            expect.stringContaining('LOWER(user.name)'),
            { search: '%jeiel%' },
        );
    });

    it('deve atualizar um usuário existente', async () => {
        usersRepository.findOne.mockResolvedValue(mockUser);
        usersRepository.save.mockImplementation(
            async (user: UserEntity) => user,
        );

        const result = await usersService.update('user-1', {
            name: 'Novo Nome',
        });

        expect(result.name).toBe('Novo Nome');
        expect(
            usersRepository.save,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'user-1',
                name: 'Novo Nome',
            }),
        );
    });

    it('deve remover um usuário existente', async () => {
        usersRepository.findOne.mockResolvedValue(mockUser);
        usersRepository.remove.mockResolvedValue(mockUser);

        const result = await usersService.remove('user-1');

        expect(usersRepository.remove).toHaveBeenCalledWith(mockUser);
        expect(result).toEqual({
            message: 'Usuário removido com sucesso',
        });
    });

    it('deve atualizar o avatar de um usuário', async () => {
        usersRepository.findOne.mockResolvedValue(mockUser);
        usersRepository.save.mockImplementation(
            async (user: UserEntity) => user,
        );

        const result = await usersService.updateAvatar(
            'user-1',
            '/uploads/avatars/x.png',
        );

        expect(result.avatarUrl).toBe('/uploads/avatars/x.png');
        expect(
            usersRepository.save,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'user-1',
                avatarUrl: '/uploads/avatars/x.png',
            }),
        );
    });
});