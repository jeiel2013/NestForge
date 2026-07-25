import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { OAuthProfile } from './google.strategy';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor() {
        super({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.APP_URL}/auth/github/callback`,
            scope: ['user:email'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: unknown, user?: OAuthProfile) => void,
    ) {
        // o e-mail pode vir vazio se o usuário deixou o e-mail privado no GitHub
        const email =
            profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`;

        const oauthProfile: OAuthProfile = {
            provider: 'github',
            providerUserId: profile.id,
            email,
            name: profile.displayName || profile.username || 'Usuário GitHub',
        };

        done(null, oauthProfile);
    }
}