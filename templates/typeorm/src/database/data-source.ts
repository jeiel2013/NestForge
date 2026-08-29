import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
    createTypeOrmOptions,
    DatabaseType,
} from './typeorm-options';

const databaseType = (
    process.env.DB_TYPE ?? 'postgres'
) as DatabaseType;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL não foi definida');
}

export default new DataSource(
    createTypeOrmOptions(databaseType, databaseUrl),
);