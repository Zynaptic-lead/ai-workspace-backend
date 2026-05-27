import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsOptional()
  sendToAll?: boolean;
}