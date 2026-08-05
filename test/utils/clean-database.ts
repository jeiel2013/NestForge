import { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient) {
    await prisma.$transaction([
        prisma.refreshToken.deleteMany(),
        prisma.passwordResetToken.deleteMany(),
        prisma.emailVerificationToken.deleteMany(),
        prisma.oAuthAccount.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}