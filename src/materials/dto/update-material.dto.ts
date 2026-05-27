import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MaterialType } from '@prisma/client';

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;
}