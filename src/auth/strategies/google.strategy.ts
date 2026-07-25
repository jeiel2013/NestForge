import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

export interface OAuthProfile {
    provider: 'google' | 'github';
    providerUserId: string;
    email: string;
    name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.APP_URL}/auth/google/callback`,
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