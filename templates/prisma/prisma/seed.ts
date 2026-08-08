import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const SEED_USERS: SeedUser[] = [
  { name: 'Admin', email: 'admin@nestforge.dev', password: 'admin123', role: Role.ADMIN },
  { name: 'Manager', email: 'manager@nestforge.dev', password: 'manager123', role: Role.MANAGER },
  { name: 'Usuário', email: 'user@nestforge.dev', password: 'user1234', role: Role.USER },
];

async function main() {
  for (const seedUser of SEED_USERS) {
    const passwordHash = await bcrypt.hash(seedUser.password, 10);

    await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: {
        name: seedUser.name,
        email: seedUser.email,
        passwordHash,
        role: seedUser.role,
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`Seed: ${seedUser.email} / ${seedUser.password} (${seedUser.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });