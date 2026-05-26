import { IsNotEmpty, IsString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  sortOrder!: number;

  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}