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
        if (prisma) {
            await prisma.$disconnect();
        }

        if (app) {
            await app.close();
        }
    })

    it('registra, autentica e encerra uma sessão protegida por CSRF', async () => {
        const agent = request.agent(app.getHttpServer());

        await agent
            .get('/users/me')
            .expect(401);

        const csrfResponse = await agent
            .get('/auth/csrf-token')
            .expect(200);

        const csrfToken = csrfResponse.body.csrfToken as string;

        expect(csrfToken).toMatch(/^[a-f0-9]{64}$/);

        // Requisições que alteram estado devem ser rejeitadas sem o token.
        await agent
            .post('/auth/register')
            .send({
                name: 'Jeiel',
                email: 'jeiel.session@example.com',
                password: 'senhaForte123',
            })
            .expect(403);

        const registerResponse = await agent
            .post('/auth/register')
            .set('x-csrf-token', csrfToken)
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

        const authenticatedCsrfToken =
            registerResponse.body.csrfToken as string;

        expect(authenticatedCsrfToken).toMatch(/^[a-f0-9]{64}$/);
        expect(authenticatedCsrfToken).not.toBe(csrfToken);

        const authenticatedResponse = await agent
            .get('/users/me')
            .expect(200);

        expect(authenticatedResponse.body.email).toBe(
            'jeiel.session@example.com',
        );

        await agent
            .post('/auth/logout')
            .set('x-csrf-token', authenticatedCsrfToken)
            .expect(200);

        await agent
            .get('/users/me')
            .expect(401);
    });

    it('realiza login e renova o token CSRF da sessão', async () => {
        const registrationAgent = request.agent(
            app.getHttpServer(),
        );

        const registrationCsrfResponse = await registrationAgent
            .get('/auth/csrf-token')
            .expect(200);

        const registrationCsrfToken =
            registrationCsrfResponse.body.csrfToken as string;

        const registrationResponse = await registrationAgent
            .post('/auth/register')
            .set('x-csrf-token', registrationCsrfToken)
            .send({
                name: 'Usuário de sessão',
                email: 'login.session@example.com',
                password: 'senhaForte123',
            })
            .expect(201);

        await registrationAgent
            .post('/auth/logout')
            .set(
                'x-csrf-token',
                registrationResponse.body.csrfToken,
            )
            .expect(200);

        const loginAgent = request.agent(app.getHttpServer());

        const loginCsrfResponse = await loginAgent
            .get('/auth/csrf-token')
            .expect(200);

        const loginCsrfToken =
            loginCsrfResponse.body.csrfToken as string;

        const loginResponse = await loginAgent
            .post('/auth/login')
            .set('x-csrf-token', loginCsrfToken)
            .send({
                email: 'login.session@example.com',
                password: 'senhaForte123',
            })
            .expect(200);

        expect(loginResponse.body.user.email).toBe(
            'login.session@example.com',
        );

        expect(loginResponse.body.csrfToken).toMatch(
            /^[a-f0-9]{64}$/,
        );
        expect(loginResponse.body.csrfToken).not.toBe(
            loginCsrfToken,
        );

        await loginAgent
            .get('/users/me')
            .expect(200);
    });
});