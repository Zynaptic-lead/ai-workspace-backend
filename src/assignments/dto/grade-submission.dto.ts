import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GradeSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  score!: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}