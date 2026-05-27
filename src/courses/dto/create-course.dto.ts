import { IsNotEmpty, IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Programming', description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'CSC 101', description: 'Course code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Basic programming concepts using Python', description: 'Course description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 3, description: 'Course units' })
  @IsInt()
  @IsOptional()
  units?: number;

  @ApiPropertyOptional({ example: 'uuid', description: 'Department ID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Level ID' })
  @IsUUID()
  @IsOptional()
  levelId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Session ID' })
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Teacher ID' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;
}