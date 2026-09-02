// nestforge:feature-file:auth:enabled
import type { DrizzleDatabase } from '../../src/database/database.types';
import {
    oauthAccounts,
    users,
} from '../../src/database/schema';

// nestforge:feature:auth:token
import { refreshTokens } from '../../src/database/schema';
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
import {
    emailVerificationTokens,
    passwordResetTokens,
} from '../../src/database/schema';
// nestforge:feature:redis,auth:password:end

// nestforge:feature:auth:session
import { sessions } from '../../src/database/schema';
// nestforge:feature:auth:session:end

export async function cleanDatabase(
    database: DrizzleDatabase,
): Promise<void> {
    // nestforge:feature:database:postgres
    await database.transaction(
        async (transaction) => {
            // nestforge:feature:auth:session
            await transaction.delete(sessions);
            // nestforge:feature:auth:session:end

            // nestforge:feature:auth:token
            await transaction.delete(refreshTokens);
            // nestforge:feature:auth:token:end

            // nestforge:feature:redis,auth:password
            await transaction.delete(
                passwordResetTokens,
            );

            await transaction.delete(
                emailVerificationTokens,
            );
            // nestforge:feature:redis,auth:password:end

            await transaction.delete(oauthAccounts);
            await transaction.delete(users);
        },
    );
    // nestforge:feature:database:postgres:end

    // nestforge:feature:database:mysql
    await database.transaction(
        async (transaction) => {
            // nestforge:feature:auth:session
            await transaction.delete(sessions);
            // nestforge:feature:auth:session:end

            // nestforge:feature:auth:token
            await transaction.delete(refreshTokens);
            // nestforge:feature:auth:token:end

            // nestforge:feature:redis,auth:password
            await transaction.delete(
                passwordResetTokens,
            );

            await transaction.delete(
                emailVerificationTokens,
            );
            // nestforge:feature:redis,auth:password:end

            await transaction.delete(oauthAccounts);
            await transaction.delete(users);
        },
    );
    // nestforge:feature:database:mysql:end

    // nestforge:feature:database:sqlite
    database.transaction((transaction) => {
        // nestforge:feature:auth:session
        transaction.delete(sessions).run();
        // nestforge:feature:auth:session:end

        // nestforge:feature:auth:token
        transaction.delete(refreshTokens).run();
        // nestforge:feature:auth:token:end

        // nestforge:feature:redis,auth:password
        transaction
            .delete(passwordResetTokens)
            .run();

        transaction
            .delete(emailVerificationTokens)
            .run();
        // nestforge:feature:redis,auth:password:end

        transaction.delete(oauthAccounts).run();
        transaction.delete(users).run();
    });
    // nestforge:feature:database:sqlite:end
}