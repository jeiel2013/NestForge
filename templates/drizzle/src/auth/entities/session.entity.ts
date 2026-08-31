// nestforge:feature-file:auth:session
import { ISession } from 'connect-typeorm';
import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    ValueTransformer,
} from 'typeorm';

const bigintTransformer: ValueTransformer = {
    to: (value: number) => value,
    from: (value: string | number) => Number(value),
};

@Entity({ name: 'sessions' })
export class SessionEntity implements ISession {
    @Index()
    @Column({
        name: 'expired_at',
        type: 'bigint',
        transformer: bigintTransformer,
    })
    expiredAt = Date.now();

    @PrimaryColumn({
        type: 'varchar',
        length: 255,
    })
    id = '';

    @Column({ type: 'text' })
    json = '';

    @DeleteDateColumn({
        name: 'destroyed_at',
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
    destroyedAt?: Date;
}