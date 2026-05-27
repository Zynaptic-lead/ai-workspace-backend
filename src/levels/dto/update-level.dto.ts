import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLevelDto {
  @ApiPropertyOptional({ example: '200 Level', description: 'Level name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '200L', description: 'Level code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 2, description: 'Sort order' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}