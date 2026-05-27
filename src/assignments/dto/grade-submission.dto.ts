import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty({ example: 85, description: 'Score awarded' })
  @IsNumber()
  @IsNotEmpty()
  score!: number;

  @ApiPropertyOptional({ example: 'Good work! Improve on question 4.', description: 'Feedback for student' })
  @IsString()
  @IsOptional()
  feedback?: string;
}