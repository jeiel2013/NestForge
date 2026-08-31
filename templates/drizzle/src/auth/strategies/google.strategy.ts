import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface OAuthProfile {
    provider: 'google' | 'github';
    providerUserId: string;
    email: string;
    name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>(
                'GOOGLE_CLIENT_SECRET',
            ),
            callbackURL: `${configService.getOrThrow<string>(
                'APP_URL',
            )}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        const oauthProfile: OAuthProfile = {
            provider: 'google',
            providerUserId: profile.id,
            email: profile.emails?.[0]?.value ?? '',
            name: profile.displayName,
        };

        done(null, oauthProfile);
    }
}