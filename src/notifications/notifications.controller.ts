import {
  Controller, Get, Post, Body, Patch, Param, UseGuards, Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  async sendNotification(
    @Body() dto: CreateNotificationDto,
    @Req() req: RequestWithUser,
  ) {
    if (dto.sendToAll) {
      return this.notificationsService.sendToAll(
        dto.title,
        dto.message,
        dto.type,
        req.user.schoolId,
      );
    }

    if (dto.userId) {
      return this.notificationsService.create(
        dto.title,
        dto.message,
        dto.type,
        req.user.schoolId,
        dto.userId,
      );
    }

    return { message: 'Please provide userId or sendToAll' };
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  getMyNotifications(@Req() req: RequestWithUser) {
    return this.notificationsService.getMyNotifications(req.user.id);
  }

  @Patch(':id/read')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}