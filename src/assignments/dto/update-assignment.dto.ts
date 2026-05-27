import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ example: 'Updated Quiz Title', description: 'Assignment title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Assignment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-07-15T23:59:59.000Z', description: 'Due date (ISO format)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 50, description: 'Total points' })
  @IsNumber()
  @IsOptional()
  totalPoints?: number;
}