// nestforge:feature-file:auth:password
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { UserEntity } from '../users/entities/user.entity';
import { Role } from '../common/constants/role.enum';

interface SeedUser {
    name: string;
    email: string;
    password: string;
    role: Role;
}

const SEED_USERS: SeedUser[] = [
    {
        name: 'Admin',
        email: 'admin@nestforge.dev',
        password: 'admin123',
        role: Role.ADMIN,
    },
    {
        name: 'Manager',
        email: 'manager@nestforge.dev',
        password: 'manager123',
        role: Role.MANAGER,
    },
    {
        name: 'User',
        email: 'user@nestforge.dev',
        password: 'user1234',
        role: Role.USER,
    },
];

async function seed() {
    await dataSource.initialize();

    try {
        const usersRepository =
            dataSource.getRepository(UserEntity);

        for (const seedUser of SEED_USERS) {
            const existingUser =
                await usersRepository.findOne({
                    where: {
                        email: seedUser.email,
                    },
                });

            if (!existingUser) {
                const passwordHash = await bcrypt.hash(
                    seedUser.password,
                    10,
                );

                const user = usersRepository.create({
                    name: seedUser.name,
                    email: seedUser.email,
                    passwordHash,
                    role: seedUser.role,
                    emailVerifiedAt: new Date(),
                });

                await usersRepository.save(user);
            }

            console.log(
                `Seed: ${seedUser.email} / ${seedUser.password} (${seedUser.role})`,
            );
        }
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

seed().catch((error: unknown) => {
    console.error('Error while running the seed:', error);
    process.exitCode = 1;
});
