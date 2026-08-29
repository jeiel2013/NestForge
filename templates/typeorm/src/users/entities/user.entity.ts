import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Role } from '../../common/constants/role.enum';
// nestforge:feature:auth:token
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity';
// nestforge:feature:auth:token:end
import { OAuthAccountEntity } from '../../auth/entities/oauth-account.entity';
// nestforge:feature:redis,auth:password
import { PasswordResetTokenEntity } from '../../auth/entities/password-reset-token.entity';
import { EmailVerificationTokenEntity } from '../../auth/entities/email-verification-token.entity';
// nestforge:feature:redis,auth:password:end

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

    // nestforge:feature:auth:token
    @OneToMany(
        () => RefreshTokenEntity,
        (refreshToken) => refreshToken.user,
    )
    refreshTokens!: RefreshTokenEntity[];
    // nestforge:feature:auth:token:end

    @OneToMany(
        () => OAuthAccountEntity,
        (oauthAccount) => oauthAccount.user,
    )
    oauthAccounts!: OAuthAccountEntity[];

    // nestforge:feature:redis,auth:password
    @OneToMany(
        () => PasswordResetTokenEntity,
        (token) => token.user,
    )
    passwordResetTokens!: PasswordResetTokenEntity[];

    @OneToMany(
        () => EmailVerificationTokenEntity,
        (token) => token.user,
    )
    emailVerificationTokens!: EmailVerificationTokenEntity[];
    // nestforge:feature:redis,auth:password:end

    constructor(partial?: Partial<UserEntity>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}