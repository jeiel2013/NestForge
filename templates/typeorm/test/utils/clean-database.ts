// nestforge:feature-file:auth:enabled
import { DataSource } from 'typeorm';
import { UserEntity } from '../../src/users/entities/user.entity';
import { OAuthAccountEntity } from '../../src/auth/entities/oauth-account.entity';

// nestforge:feature:auth:token
import { RefreshTokenEntity } from '../../src/auth/entities/refresh-token.entity';
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
import { PasswordResetTokenEntity } from '../../src/auth/entities/password-reset-token.entity';
import { EmailVerificationTokenEntity } from '../../src/auth/entities/email-verification-token.entity';
// nestforge:feature:redis,auth:password:end

// nestforge:feature:auth:session
import { SessionEntity } from '../../src/auth/entities/session.entity';
// nestforge:feature:auth:session:end

export async function cleanDatabase(
    dataSource: DataSource,
) {
    await dataSource.transaction(async (manager) => {
        // nestforge:feature:auth:session
        await manager
            .createQueryBuilder()
            .delete()
            .from(SessionEntity)
            .execute();
        // nestforge:feature:auth:session:end

        // nestforge:feature:auth:token
        await manager
            .createQueryBuilder()
            .delete()
            .from(RefreshTokenEntity)
            .execute();
        // nestforge:feature:auth:token:end

        // nestforge:feature:redis,auth:password
        await manager
            .createQueryBuilder()
            .delete()
            .from(PasswordResetTokenEntity)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from(EmailVerificationTokenEntity)
            .execute();
        // nestforge:feature:redis,auth:password:end

        await manager
            .createQueryBuilder()
            .delete()
            .from(OAuthAccountEntity)
            .execute();

        await manager
            .createQueryBuilder()
            .delete()
            .from(UserEntity)
            .execute();
    });
}