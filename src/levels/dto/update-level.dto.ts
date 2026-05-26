import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateLevelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}