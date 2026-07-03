import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Duda' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'duda@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaForte123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role, required: false, default: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
