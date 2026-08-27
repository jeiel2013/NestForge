// nestforge:feature-file:auth:password,auth:session
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestApp } from './utils/e2e-setup';
import { cleanDatabase } from './utils/clean-database';

describe('Session auth (e2e)', () => {
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

    it('registra, autentica e encerra uma sessão por cookie', async () => {
        const agent = request.agent(app.getHttpServer());

        await agent
            .get('/users/me')
            .expect(401);

        const registerResponse = await agent
            .post('/auth/register')
            .send({
                name: 'Jeiel',
                email: 'jeiel.session@example.com',
                password: 'senhaForte123',
            })
            .expect(201);

        expect(registerResponse.body.user).toMatchObject({
            email: 'jeiel.session@example.com',
        });

        expect(registerResponse.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringContaining('nestforge.sid='),
            ]),
        );

        const authenticatedResponse = await agent
            .get('/users/me')
            .expect(200);

        expect(authenticatedResponse.body.email).toBe(
            'jeiel.session@example.com',
        );

        await agent
            .post('/auth/logout')
            .expect(200);

        await agent
            .get('/users/me')
            .expect(401);
    });

    it('realiza login e mantém a sessão entre requisições', async () => {
        const registrationAgent = request.agent(app.getHttpServer());

        await registrationAgent
            .post('/auth/register')
            .send({
                name: 'Usuário de sessão',
                email: 'login.session@example.com',
                password: 'senhaForte123',
            })
            .expect(201);

        await registrationAgent
            .post('/auth/logout')
            .expect(200);

        const loginAgent = request.agent(app.getHttpServer());

        const loginResponse = await loginAgent
            .post('/auth/login')
            .send({
                email: 'login.session@example.com',
                password: 'senhaForte123',
            })
            .expect(200);

        expect(loginResponse.body.user.email).toBe(
            'login.session@example.com',
        );

        await loginAgent
            .get('/users/me')
            .expect(200);
    });
});