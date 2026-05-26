import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  totalPoints?: number;

  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}