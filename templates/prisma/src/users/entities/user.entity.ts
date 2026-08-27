import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserEntity {
    id!: string;
    name!: string;
    email!: string;
    role!: Role;
    avatarUrl!: string | null;
    emailVerifiedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;

    @Exclude()
    passwordHash?: string | null;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}