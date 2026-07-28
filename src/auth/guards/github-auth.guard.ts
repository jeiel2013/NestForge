import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
    constructor() {
        // API stateless (Bearer token) — não usamos sessão do Passport/Express
        super({ session: false });
    }
}