import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import {
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Role } from '../common/constants/role.enum';
import type { DrizzleDatabase } from '../database/database.types';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

function createSelectBuilder<T>(result: T[]) {
    const builder: any = {};

    builder.from = vi.fn(() => builder);
    builder.where = vi.fn(() => builder);
    builder.orderBy = vi.fn(() => builder);
    builder.limit = vi.fn(() => builder);
    builder.offset = vi.fn(() => builder);

    builder.then = (
        resolve: (value: T[]) => unknown,
        reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject);

    return builder;
}

describe('UsersService', () => {
    let usersService: UsersService;
    let database: any;
    let insertValues: ReturnType<typeof vi.fn>;
    let updateSet: ReturnType<typeof vi.fn>;
    let updateWhere: ReturnType<typeof vi.fn>;
    let deleteWhere: ReturnType<typeof vi.fn>;
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

        insertValues = vi.fn().mockResolvedValue(undefined);

        updateWhere = vi.fn().mockResolvedValue(undefined);
        updateSet = vi.fn(() => ({
            where: updateWhere,
        }));

        deleteWhere = vi.fn().mockResolvedValue(undefined);

        database = {
            select: vi.fn(),
            insert: vi.fn(() => ({
                values: insertValues,
            })),
            update: vi.fn(() => ({
                set: updateSet,
            })),
            delete: vi.fn(() => ({
                where: deleteWhere,
            })),
        };

        usersService = new UsersService(
            database as unknown as DrizzleDatabase,
        );
    });

    it('throws ConflictException when the email already exists during creation', async () => {
        database.select.mockReturnValueOnce(
            createSelectBuilder([
                {
                    id: mockUser.id,
                },
            ]),
        );

        await expect(
            usersService.create({
                name: 'Jeiel',
                email: 'jeiel@example.com',
                password: 'strongPassword123',
            }),
        ).rejects.toBeInstanceOf(ConflictException);

        expect(database.insert).not.toHaveBeenCalled();
    });

    it('creates a user and hides passwordHash during serialization', async () => {
        database.select
            .mockReturnValueOnce(createSelectBuilder([]))
            .mockReturnValueOnce(
                createSelectBuilder([mockUser]),
            );

        const result = await usersService.create({
            name: 'Jeiel',
            email: 'jeiel@example.com',
            password: 'strongPassword123',
        });

        expect(result.email).toBe(
            'jeiel@example.com',
        );

        expect(
            instanceToPlain(result),
        ).not.toHaveProperty('passwordHash');

        expect(database.insert).toHaveBeenCalled();
        expect(insertValues).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jeiel',
                email: 'jeiel@example.com',
                role: Role.USER,
                passwordHash: expect.any(String),
            }),
        );
    });

    it('throws NotFoundException when the user does not exist', async () => {
        database.select.mockReturnValueOnce(
            createSelectBuilder([]),
        );

        await expect(
            usersService.findOne('id-invalido'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns paginated data from findAll', async () => {
        const usersBuilder = createSelectBuilder([
            mockUser,
        ]);

        const countBuilder = createSelectBuilder([
            {
                value: 1,
            },
        ]);

        database.select
            .mockReturnValueOnce(usersBuilder)
            .mockReturnValueOnce(countBuilder);

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
        expect(usersBuilder.offset).toHaveBeenCalledWith(
            0,
        );
        expect(usersBuilder.limit).toHaveBeenCalledWith(
            10,
        );
    });

    it('applies search and role filters in findAll', async () => {
        const usersBuilder = createSelectBuilder([
            mockUser,
        ]);

        const countBuilder = createSelectBuilder([
            {
                value: 1,
            },
        ]);

        database.select
            .mockReturnValueOnce(usersBuilder)
            .mockReturnValueOnce(countBuilder);

        await usersService.findAll({
            page: 1,
            limit: 10,
            search: 'jeiel',
            role: Role.USER,
        });

        expect(
            usersBuilder.where,
        ).toHaveBeenCalledWith(
            expect.anything(),
        );

        expect(
            countBuilder.where,
        ).toHaveBeenCalledWith(
            expect.anything(),
        );
    });

    it('updates an existing user', async () => {
        const updatedUser = new UserEntity({
            ...mockUser,
            name: 'Novo Nome',
            updatedAt: new Date(),
        });

        database.select
            .mockReturnValueOnce(
                createSelectBuilder([mockUser]),
            )
            .mockReturnValueOnce(
                createSelectBuilder([updatedUser]),
            );

        const result = await usersService.update(
            'user-1',
            {
                name: 'Novo Nome',
            },
        );

        expect(result.name).toBe('Novo Nome');

        expect(updateSet).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Novo Nome',
                updatedAt: expect.any(Date),
            }),
        );

        expect(updateWhere).toHaveBeenCalled();
    });

    it('deletes an existing user', async () => {
        database.select.mockReturnValueOnce(
            createSelectBuilder([mockUser]),
        );

        const result = await usersService.remove(
            'user-1',
        );

        expect(database.delete).toHaveBeenCalled();
        expect(deleteWhere).toHaveBeenCalled();

        expect(result).toEqual({
            message: 'User deleted successfully',
        });
    });

    it('updates a user avatar', async () => {
        const updatedUser = new UserEntity({
            ...mockUser,
            avatarUrl: '/uploads/avatars/x.png',
            updatedAt: new Date(),
        });

        database.select
            .mockReturnValueOnce(
                createSelectBuilder([mockUser]),
            )
            .mockReturnValueOnce(
                createSelectBuilder([updatedUser]),
            );

        const result = await usersService.updateAvatar(
            'user-1',
            '/uploads/avatars/x.png',
        );

        expect(result.avatarUrl).toBe(
            '/uploads/avatars/x.png',
        );

        expect(updateSet).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: '/uploads/avatars/x.png',
                updatedAt: expect.any(Date),
            }),
        );

        expect(updateWhere).toHaveBeenCalled();
    });
});
