import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiPropertyOptional({ example: '2025/2026 Updated', description: 'Session name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2025-09-15', description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-15', description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: false, description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}