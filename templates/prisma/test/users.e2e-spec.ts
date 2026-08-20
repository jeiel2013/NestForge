// nestforge:feature-file:auth:jwt
import { INestApplication } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { createTestApp } from './utils/e2e-setup';
import { cleanDatabase } from './utils/clean-database';

describe('Users (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    async function createUserWithRole(email: string, password: string, role: Role) {
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { name: 'Usuário de teste', email, passwordHash, role, emailVerifiedAt: new Date() },
        });
    }

    async function loginAndGetToken(email: string, password: string) {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password })
            .expect(200);
        return response.body.accessToken as string;
    }

    beforeAll(async () => {
        app = await createTestApp();
        prisma = new PrismaClient();
    });

    beforeEach(async () => {
        await cleanDatabase(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    it('rejeita acesso sem token', async () => {
        await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('ADMIN consegue criar, listar, atualizar e remover um usuário', async () => {
        await createUserWithRole('admin.e2e@example.com', 'senhaForte123', Role.ADMIN);
        const token = await loginAndGetToken('admin.e2e@example.com', 'senhaForte123');
        const server = app.getHttpServer();

        const createResponse = await request(server)
            .post('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Novo Usuário', email: 'novo.e2e@example.com', password: 'senhaForte123' })
            .expect(201);

        expect(createResponse.body).not.toHaveProperty('passwordHash');
        const userId = createResponse.body.id;

        const listResponse = await request(server)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(listResponse.body.meta.total).toBeGreaterThanOrEqual(1);

        await request(server)
            .patch(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Nome Atualizado' })
            .expect(200);

        await request(server)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });

    // nestforge:feature:rbac
    it('USER consegue ler mas não consegue criar usuário', async () => {
        await createUserWithRole('user.e2e@example.com', 'senhaForte123', Role.USER);
        const token = await loginAndGetToken('user.e2e@example.com', 'senhaForte123');
        const server = app.getHttpServer();

        await request(server).get('/users').set('Authorization', `Bearer ${token}`).expect(200);

        await request(server)
            .post('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Não deveria criar', email: 'bloqueado.e2e@example.com', password: 'senhaForte123' })
            .expect(403);
    });
    // nestforge:feature:rbac:end

    it('GET /users/me retorna o usuário autenticado', async () => {
        await createUserWithRole('me.e2e@example.com', 'senhaForte123', Role.USER);
        const token = await loginAndGetToken('me.e2e@example.com', 'senhaForte123');

        const response = await request(app.getHttpServer())
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.email).toBe('me.e2e@example.com');
    });
});