import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Welcome to the new semester', description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Classes start on Monday. Check your courses.', description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ enum: NotificationType, example: 'ANNOUNCEMENT', description: 'Notification type' })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({ example: 'uuid', description: 'Specific user ID (if sending to one user)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: true, description: 'Send to all users in school' })
  @IsBoolean()
  @IsOptional()
  sendToAll?: boolean;
}