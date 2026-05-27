import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Chapter 1 Notes', description: 'Material title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Introduction to Python basics', description: 'Material description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/file.pdf', description: 'File URL' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ enum: MaterialType, example: 'NOTE', description: 'Material type' })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @ApiProperty({ example: 'uuid', description: 'Course ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}