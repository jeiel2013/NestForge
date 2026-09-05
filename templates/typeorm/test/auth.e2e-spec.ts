// nestforge:feature-file:auth:password,auth:token
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createTestApp } from './utils/e2e-setup';
import { cleanDatabase } from './utils/clean-database';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await createTestApp();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await cleanDatabase(dataSource);
    });

    afterAll(async () => {
        await app.close();
    });

    it('registers, logs in, refreshes, and revokes the token', async () => {
        const server = app.getHttpServer();

        const registerResponse = await request(server)
            .post('/auth/register')
            .send({
                name: 'Jeiel',
                email: 'jeiel.e2e@example.com',
                password: 'strongPassword123',
            })
            .expect(201);

        expect(registerResponse.body).toHaveProperty(
            'accessToken',
        );

        expect(registerResponse.body).toHaveProperty(
            'refreshToken',
        );

        const loginResponse = await request(server)
            .post('/auth/login')
            .send({
                email: 'jeiel.e2e@example.com',
                password: 'strongPassword123',
            })
            .expect(200);

        const refreshResponse = await request(server)
            .post('/auth/refresh')
            .send({
                refreshToken:
                    loginResponse.body.refreshToken,
            })
            .expect(200);

        expect(refreshResponse.body).toHaveProperty(
            'accessToken',
        );

        await request(server)
            .post('/auth/logout')
            .send({
                refreshToken:
                    refreshResponse.body.refreshToken,
            })
            .expect(200);

        await request(server)
            .post('/auth/refresh')
            .send({
                refreshToken:
                    refreshResponse.body.refreshToken,
            })
            .expect(401);
    });

    it('rejects registration with a duplicate email', async () => {
        const server = app.getHttpServer();

        const payload = {
            name: 'Jeiel',
            email: 'duplicate.e2e@example.com',
            password: 'strongPassword123',
        };

        await request(server)
            .post('/auth/register')
            .send(payload)
            .expect(201);

        await request(server)
            .post('/auth/register')
            .send(payload)
            .expect(409);
    });

    it('rejects login with invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'naoexiste.e2e@example.com',
                password: 'qualquerSenha123',
            })
            .expect(401);
    });
});
