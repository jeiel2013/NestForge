import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class FindUsersQueryDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Busca por nome ou e-mail' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: Role, description: 'Filtra por role' })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}