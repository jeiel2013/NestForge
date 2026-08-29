import { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient) {
    await prisma.$transaction([
        // nestforge:feature:auth:session
        prisma.session.deleteMany(),
        // nestforge:feature:auth:session:end
        prisma.refreshToken.deleteMany(),
        prisma.passwordResetToken.deleteMany(),
        prisma.emailVerificationToken.deleteMany(),
        prisma.oAuthAccount.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}