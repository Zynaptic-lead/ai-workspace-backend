import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Test Academy', description: 'Name of the school' })
  @IsString()
  @IsNotEmpty()
  schoolName!: string;

  @ApiProperty({ example: 'John Admin', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'admin@test.com', description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password!: string;
}