import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { OAuthProfile } from './google.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>(
                'GITHUB_CLIENT_SECRET',
            ),
            callbackURL: `${configService.getOrThrow<string>(
                'APP_URL',
            )}/auth/github/callback`,
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