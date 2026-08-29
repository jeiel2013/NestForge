import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    TypeOrmModule,
    TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import {
    createTypeOrmOptions,
    DatabaseType,
} from './typeorm-options';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ): TypeOrmModuleOptions => {
                const databaseType =
                    configService.getOrThrow<DatabaseType>(
                        'DB_TYPE',
                    );

                const databaseUrl =
                    configService.getOrThrow<string>(
                        'DATABASE_URL',
                    );

                return createTypeOrmOptions(
                    databaseType,
                    databaseUrl,
                );
            },
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }