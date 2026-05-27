import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Updated Course Title', description: 'Course title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'CSC 102', description: 'Course code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Course description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 4, description: 'Course units' })
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