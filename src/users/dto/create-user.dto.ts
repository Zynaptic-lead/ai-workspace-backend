import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Teacher', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'jane@test.com', description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: Role, example: 'TEACHER', description: 'User role' })
  @IsEnum(Role)
  role!: Role;
}