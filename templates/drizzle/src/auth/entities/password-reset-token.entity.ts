// nestforge:feature-file:redis,auth:password
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'token_hash',
        type: 'varchar',
        length: 64,
        unique: true,
    })
    tokenHash!: string;

    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 36,
    })
    userId!: string;

    @ManyToOne(() => UserEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @Column({
        name: 'expires_at',
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
    expiresAt!: Date;

    @Column({
        name: 'used_at',
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
    usedAt!: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}