import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'jeiel@example.com' })
    @IsEmail()
    email: string;
}