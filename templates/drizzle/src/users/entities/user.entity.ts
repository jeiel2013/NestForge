import { Exclude } from 'class-transformer';
import type { User } from '../../database/schema';

export class UserEntity {
    id!: string;
    name!: string;
    email!: string;

    @Exclude()
    passwordHash!: string | null;

    role!: User['role'];
    avatarUrl!: string | null;
    emailVerifiedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial?: Partial<User>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}