import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'Bob Student', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'bob@test.com', description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'uuid', description: 'School ID' })
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Department ID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Level ID' })
  @IsUUID()
  @IsOptional()
  levelId?: string;
}