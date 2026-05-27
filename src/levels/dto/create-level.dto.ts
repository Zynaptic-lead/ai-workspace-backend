import { IsNotEmpty, IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty({ example: '100 Level', description: 'Level name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '100L', description: 'Level code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 1, description: 'Sort order' })
  @IsInt()
  sortOrder!: number;

  @ApiPropertyOptional({ example: 'uuid', description: 'Session ID' })
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Department ID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}