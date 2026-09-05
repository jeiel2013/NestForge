// nestforge:feature-file:auth:password,auth:token
import { INestApplication } from '@nestjs/common';
import {
    DataSource,
    Repository,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { Role } from '../src/common/constants/role.enum';
import { UserEntity } from '../src/users/entities/user.entity';
import { createTestApp } from './utils/e2e-setup';
import { cleanDatabase } from './utils/clean-database';

describe('Users (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let usersRepository: Repository<UserEntity>;

    async function createUserWithRole(
        email: string,
        password: string,
        role: Role,
    ) {
        const passwordHash = await bcrypt.hash(
            password,
            10,
        );

        const user = usersRepository.create({
            name: 'Test User',
            email,
            passwordHash,
            role,
            emailVerifiedAt: new Date(),
        });

        await usersRepository.save(user);
    }

    async function loginAndGetToken(
        email: string,
        password: string,
    ) {
        const response = await request(
            app.getHttpServer(),
        )
            .post('/auth/login')
            .send({ email, password })
            .expect(200);

        return response.body.accessToken as string;
    }

    beforeAll(async () => {
        app = await createTestApp();
        dataSource = app.get(DataSource);
        usersRepository =
            dataSource.getRepository(UserEntity);
    });

    beforeEach(async () => {
        await cleanDatabase(dataSource);
    });

    afterAll(async () => {
        await app.close();
    });

    it('rejects access without a token', async () => {
        await request(app.getHttpServer())
            .get('/users')
            .expect(401);
    });

    it('allows ADMIN to create, list, update, and delete a user', async () => {
        await createUserWithRole(
            'admin.e2e@example.com',
            'strongPassword123',
            Role.ADMIN,
        );

        const token = await loginAndGetToken(
            'admin.e2e@example.com',
            'strongPassword123',
        );

        const server = app.getHttpServer();

        const createResponse = await request(server)
            .post('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New User',
                email: 'new.e2e@example.com',
                password: 'strongPassword123',
            })
            .expect(201);

        expect(createResponse.body).not.toHaveProperty(
            'passwordHash',
        );

        const userId = createResponse.body.id;

        const listResponse = await request(server)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(
            listResponse.body.meta.total,
        ).toBeGreaterThanOrEqual(1);

        await request(server)
            .patch(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Nome Atualizado',
            })
            .expect(200);

        await request(server)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });

    // nestforge:feature:rbac
    it('allows USER to read but not create users', async () => {
        await createUserWithRole(
            'user.e2e@example.com',
            'strongPassword123',
            Role.USER,
        );

        const token = await loginAndGetToken(
            'user.e2e@example.com',
            'strongPassword123',
        );

        const server = app.getHttpServer();

        await request(server)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        await request(server)
            .post('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Should Not Be Created',
                email: 'blocked.e2e@example.com',
                password: 'strongPassword123',
            })
            .expect(403);
    });
    // nestforge:feature:rbac:end

    it('returns the authenticated user from GET /users/me', async () => {
        await createUserWithRole(
            'me.e2e@example.com',
            'strongPassword123',
            Role.USER,
        );

        const token = await loginAndGetToken(
            'me.e2e@example.com',
            'strongPassword123',
        );

        const response = await request(
            app.getHttpServer(),
        )
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.email).toBe(
            'me.e2e@example.com',
        );
    });
});
