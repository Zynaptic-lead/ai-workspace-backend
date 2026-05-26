import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, schoolId: string) {
    const department = await this.prisma.department.create({
      data: {
        name: dto.name,
        code: dto.code,
        schoolId,
      },
    });

    return { message: 'Department created successfully', department };
  }

  async findAll(schoolId: string) {
    const departments = await this.prisma.department.findMany({
      where: { schoolId },
      include: {
        head: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { users: true, courses: true },
        },
      },
    });

    return { departments };
  }

  async findOne(id: string, schoolId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, schoolId },
      include: {
        head: {
          select: { id: true, fullName: true, email: true },
        },
        users: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        courses: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return { department };
  }

  async update(id: string, dto: UpdateDepartmentDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const department = await this.prisma.department.update({
      where: { id },
      data: dto,
    });

    return { message: 'Department updated successfully', department };
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.department.delete({ where: { id } });
    return { message: 'Department deleted successfully' };
  }

  async setHead(departmentId: string, headId: string, schoolId: string) {
    await this.findOne(departmentId, schoolId);

    // Verify teacher belongs to same school
    const teacher = await this.prisma.user.findFirst({
      where: { id: headId, schoolId, role: 'TEACHER' },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found in this school');
    }

    const department = await this.prisma.department.update({
      where: { id: departmentId },
      data: { headId },
      include: {
        head: { select: { id: true, fullName: true, email: true } },
      },
    });

    return { message: 'Department head assigned successfully', department };
  }
}