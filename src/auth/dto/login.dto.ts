import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@test.com', description: 'Email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsString()
  @MinLength(6)
  password!: string;
}