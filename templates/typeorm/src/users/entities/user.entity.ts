import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/constants/role.enum';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 120 })
    name!: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
    })
    email!: string;

    @Exclude()
    @Column({
        name: 'password_hash',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    passwordHash!: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        default: Role.USER,
    })
    role!: Role;

    @Column({
        name: 'avatar_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    avatarUrl!: string | null;

    @Column({
        name: 'email_verified_at',
        nullable: true,
        // nestforge:feature:database:postgres
        type: 'timestamp with time zone',
        // nestforge:feature:database:postgres:end
        // nestforge:feature:database:mysql
        type: 'datetime',
        // nestforge:feature:database:mysql:end
        // nestforge:feature:database:sqlite
        type: 'datetime',
        // nestforge:feature:database:sqlite:end
    })
    emailVerifiedAt!: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    constructor(partial?: Partial<UserEntity>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}