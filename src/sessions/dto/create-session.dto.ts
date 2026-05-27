import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: '2025/2026', description: 'Session name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '2025-09-01', description: 'Start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-07-30', description: 'End date' })
  @IsDateString()
  endDate!: string;
}