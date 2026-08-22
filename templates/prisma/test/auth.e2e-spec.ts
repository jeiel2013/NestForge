// nestforge:feature-file:auth:password
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestApp } from './utils/e2e-setup';
import { cleanDatabase } from './utils/clean-database';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

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

    it('deve registrar, logar, renovar e revogar o token', async () => {
        const server = app.getHttpServer();

        const registerResponse = await request(server)
            .post('/auth/register')
            .send({ name: 'Jeiel', email: 'jeiel.e2e@example.com', password: 'senhaForte123' })
            .expect(201);

        expect(registerResponse.body).toHaveProperty('accessToken');
        expect(registerResponse.body).toHaveProperty('refreshToken');

        const loginResponse = await request(server)
            .post('/auth/login')
            .send({ email: 'jeiel.e2e@example.com', password: 'senhaForte123' })
            .expect(200);

        const refreshResponse = await request(server)
            .post('/auth/refresh')
            .send({ refreshToken: loginResponse.body.refreshToken })
            .expect(200);

        expect(refreshResponse.body).toHaveProperty('accessToken');

        await request(server)
            .post('/auth/logout')
            .send({ refreshToken: refreshResponse.body.refreshToken })
            .expect(200);

        // o refresh token já foi revogado no logout, então não pode ser reutilizado
        await request(server)
            .post('/auth/refresh')
            .send({ refreshToken: refreshResponse.body.refreshToken })
            .expect(401);
    });

    it('não deve permitir cadastro com e-mail duplicado', async () => {
        const server = app.getHttpServer();
        const payload = { name: 'Jeiel', email: 'duplicado.e2e@example.com', password: 'senhaForte123' };

        await request(server).post('/auth/register').send(payload).expect(201);
        await request(server).post('/auth/register').send(payload).expect(409);
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'naoexiste.e2e@example.com', password: 'qualquerSenha123' })
            .expect(401);
    });
});