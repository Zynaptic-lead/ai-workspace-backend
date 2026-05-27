import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Python Quiz 1', description: 'Assignment title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Answer all 10 questions', description: 'Assignment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z', description: 'Due date (ISO format)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 100, description: 'Total points' })
  @IsNumber()
  @IsOptional()
  totalPoints?: number;

  @ApiProperty({ example: 'uuid', description: 'Course ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}