import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Activate school and approve the admin
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
        where: {
          schoolId,
          role: 'SCHOOL_ADMIN',
        },
        data: { accountStatus: 'REJECTED' },
      });

      await tx.school.delete({
        where: { id: schoolId },
      });
    });

    return { message: 'School rejected and removed' };
  }
}