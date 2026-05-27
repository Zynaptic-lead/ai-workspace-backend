import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== CREATE USER ====================
  async create(dto: CreateUserDto, schoolId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        schoolId,
        accountStatus: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return { message: 'User created successfully', user };
  }

  // ==================== GET ALL USERS ====================
  async findAll(schoolId: string) {
    const users = await this.prisma.user.findMany({
      where: { schoolId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return { users };
  }

  // ==================== GET ONE USER ====================
  async findOne(id: string, schoolId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  // ==================== GET PENDING USERS ====================
  async getPendingUsers(schoolId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        schoolId,
        accountStatus: 'PENDING',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return { users };
  }

  // ==================== APPROVE USER ====================
  async approveUser(
    id: string,
    schoolId: string,
    approverId: string,
    approverRole: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'TEACHER' && approverRole !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException('Only school admin can approve teachers');
    }

    if (approverRole === 'TEACHER') {
      const isDeptHead = await this.prisma.department.findFirst({
        where: { headId: approverId, schoolId },
      });

      if (!isDeptHead) {
        throw new ForbiddenException('Only department heads can approve students');
      }

      if (user.departmentId !== isDeptHead.id) {
        throw new ForbiddenException('You can only approve students in your department');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: 'ACTIVE' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
      },
    });

    // Notify user
    await this.notificationsService.create(
      'Account Approved',
      'Your account has been approved. You can now login and access your dashboard.',
      'APPROVAL',
      schoolId,
      id,
    );

    return { message: 'User approved successfully', user: updated };
  }

  // ==================== REJECT USER ====================
  async rejectUser(
    id: string,
    schoolId: string,
    approverId: string,
    approverRole: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'TEACHER' && approverRole !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException('Only school admin can reject teachers');
    }

    if (approverRole === 'TEACHER') {
      const isDeptHead = await this.prisma.department.findFirst({
        where: { headId: approverId, schoolId },
      });

      if (!isDeptHead) {
        throw new ForbiddenException('Only department heads can reject students');
      }

      if (user.departmentId !== isDeptHead.id) {
        throw new ForbiddenException('You can only reject students in your department');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: 'REJECTED' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
      },
    });

    // Notify user
    await this.notificationsService.create(
      'Account Rejected',
      'Your account has been rejected. Please contact the school admin for more information.',
      'APPROVAL',
      schoolId,
      id,
    );

    return { message: 'User rejected', user: updated };
  }

  // ==================== UPDATE USER ====================
  async update(id: string, dto: UpdateUserDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const data: any = {};

    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.email) data.email = dto.email;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.role) data.role = dto.role;
    if (dto.departmentId) data.departmentId = dto.departmentId;
    if (dto.levelId) data.levelId = dto.levelId;

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        updatedAt: true,
      },
    });

    return { message: 'User updated successfully', user };
  }

  // ==================== DELETE USER ====================
  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}