import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jeiel@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaForte123' })
  @IsString()
  @MinLength(8)
  password: string;
}
