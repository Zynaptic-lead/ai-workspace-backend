import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CREATE NOTIFICATION ====================
  async create(
    title: string,
    message: string,
    type: NotificationType,
    schoolId: string,
    userId?: string,
  ) {
    if (userId) {
      // Send to specific user
      return this.prisma.notification.create({
        data: { title, message, type, userId, schoolId },
      });
    }
  }

  // ==================== SEND TO ALL IN SCHOOL ====================
  async sendToAll(
    title: string,
    message: string,
    type: NotificationType,
    schoolId: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: { schoolId, accountStatus: 'ACTIVE' },
      select: { id: true },
    });

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        title,
        message,
        type,
        userId: user.id,
        schoolId,
      })),
    });

    return { message: `Notification sent to ${users.length} users` };
  }

  // ==================== SEND TO COURSE STUDENTS ====================
  async sendToCourseStudents(
    title: string,
    message: string,
    type: NotificationType,
    courseId: string,
    schoolId: string,
  ) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    if (enrollments.length === 0) return;

    await this.prisma.notification.createMany({
      data: enrollments.map((e) => ({
        title,
        message,
        type,
        userId: e.studentId,
        schoolId,
      })),
    });
  }

  // ==================== GET MY NOTIFICATIONS ====================
  async getMyNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  // ==================== MARK AS READ ====================
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { message: 'Notification marked as read' };
  }

  // ==================== MARK ALL AS READ ====================
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }
}