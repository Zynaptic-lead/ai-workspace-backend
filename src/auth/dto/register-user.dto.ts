import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'Bob Student', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'bob@test.com', description: 'Email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '32ca8ebc-a254-446d-a7cb-bd6488fe4c6e', description: 'School ID from GET /schools' })
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({ example: 'department-uuid', description: 'Department ID from GET /departments/public' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'level-uuid', description: 'Level ID from GET /levels/public' })
  @IsUUID()
  @IsOptional()
  levelId?: string;
}