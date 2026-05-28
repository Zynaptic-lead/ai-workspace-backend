import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSchools() {
    const schools = await this.prisma.school.findMany({
      where: { isActive: true },
      include: {
        users: {
          where: { role: 'SCHOOL_ADMIN' },
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { schools };
  }

  async getPendingSchools() {
    const schools = await this.prisma.school.findMany({
      where: { isActive: false },
      include: {
        users: {
          where: { role: 'SCHOOL_ADMIN' },
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { schools };
  }

  async approveSchool(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.school.update({
        where: { id: schoolId },
        data: { isActive: true },
      });

      await tx.user.updateMany({
        where: {
          schoolId,
          role: 'SCHOOL_ADMIN',
          accountStatus: 'PENDING',
        },
        data: { accountStatus: 'ACTIVE' },
      });
    });

    return { message: 'School approved successfully' };
  }

  async rejectSchool(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { schoolId, role: 'SCHOOL_ADMIN' },
        data: { accountStatus: 'REJECTED' },
      });

      await tx.school.delete({ where: { id: schoolId } });
    });

    return { message: 'School rejected and removed' };
  }

  async deleteSchool(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { schoolId } });
      await tx.submission.deleteMany({ where: { schoolId } });
      await tx.assignment.deleteMany({ where: { schoolId } });
      await tx.material.deleteMany({ where: { schoolId } });

      const courses = await tx.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map((c) => c.id);
      if (courseIds.length > 0) {
        await tx.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
      }

      await tx.course.deleteMany({ where: { schoolId } });
      await tx.level.deleteMany({ where: { schoolId } });
      await tx.department.deleteMany({ where: { schoolId } });
      await tx.academicSession.deleteMany({ where: { schoolId } });
      await tx.refreshToken.deleteMany({ where: { user: { schoolId } } });
      await tx.user.deleteMany({ where: { schoolId } });
      await tx.school.delete({ where: { id: schoolId } });
    });

    return { message: 'School and all associated data deleted successfully' };
  }
}