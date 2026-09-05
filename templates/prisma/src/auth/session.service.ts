// nestforge:feature-file:auth:session
import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { randomBytes } from 'node:crypto';

export interface SessionUser {
    id: string;
    email: string;
    role: string;
}

@Injectable()
export class SessionService {
    async establish(request: Request, user: SessionUser) {
        await this.regenerate(request);

        const csrfToken = this.generateCsrfToken();

        request.session.user = user;
        request.session.csrfToken = csrfToken;

        await this.save(request);

        return { user, csrfToken };
    }

    async issueCsrfToken(request: Request) {
        const csrfToken = this.generateCsrfToken();

        request.session.csrfToken = csrfToken;

        await this.save(request);

        return { csrfToken };
    }

    private generateCsrfToken(): string {
        return randomBytes(32).toString('hex');
    }

    async destroy(request: Request) {
        await new Promise<void>((resolve, reject) => {
            request.session.destroy((error) => {
                if (error) {
                    reject(
                        new InternalServerErrorException(
                            'Unable to end the session',
                        ),
                    );
                    return;
                }

                resolve();
            });
        });

        return { message: 'Logout completed successfully' };
    }

    private async regenerate(request: Request): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            request.session.regenerate((error) => {
                if (error) {
                    reject(
                        new InternalServerErrorException(
                            'Unable to start the session',
                        ),
                    );
                    return;
                }

                resolve();
            });
        });
    }

    private async save(request: Request): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            request.session.save((error) => {
                if (error) {
                    reject(
                        new InternalServerErrorException(
                            'Unable to save the session',
                        ),
                    );
                    return;
                }

                resolve();
            });
        });
    }
}
