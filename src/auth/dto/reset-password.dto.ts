import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    token: string;

    @ApiProperty({ example: 'novaSenhaForte123' })
    @IsString()
    @MinLength(8)
    password: string;
}