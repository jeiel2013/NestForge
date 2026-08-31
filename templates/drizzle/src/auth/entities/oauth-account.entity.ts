import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'oauth_accounts' })
@Index(
    'oauth_accounts_provider_provider_user_id_key',
    ['provider', 'providerUserId'],
    { unique: true },
)
export class OAuthAccountEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 32,
    })
    provider!: string;

    @Column({
        name: 'provider_user_id',
        type: 'varchar',
        length: 255,
    })
    providerUserId!: string;

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}