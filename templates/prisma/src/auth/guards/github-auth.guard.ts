import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
    constructor() {
        // Stateless API (Bearer token) — Passport/Express sessions are not used.
        super({ session: false });
    }
}
