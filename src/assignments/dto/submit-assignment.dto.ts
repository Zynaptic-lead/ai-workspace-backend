import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAssignmentDto {
  @ApiPropertyOptional({ example: 'Here is my answer for the assignment', description: 'Text submission content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/file.pdf', description: 'File URL from upload' })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}