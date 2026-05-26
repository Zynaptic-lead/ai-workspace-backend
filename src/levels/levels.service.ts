import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLevelDto, schoolId: string) {
    const level = await this.prisma.level.create({
      data: {
        name: dto.name,
        code: dto.code,
        sortOrder: dto.sortOrder,
        schoolId,
        sessionId: dto.sessionId,
        departmentId: dto.departmentId,
      },
    });

    return { message: 'Level created successfully', level };
  }

  async findAll(schoolId: string) {
    const levels = await this.prisma.level.findMany({
      where: { schoolId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { users: true, courses: true },
        },
      },
    });

    return { levels };
  }

  async findOne(id: string, schoolId: string) {
    const level = await this.prisma.level.findFirst({
      where: { id, schoolId },
      include: {
        users: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        courses: true,
      },
    });

    if (!level) {
      throw new NotFoundException('Level not found');
    }

    return { level };
  }

  async update(id: string, dto: UpdateLevelDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const level = await this.prisma.level.update({
      where: { id },
      data: dto,
    });

    return { message: 'Level updated successfully', level };
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.level.delete({ where: { id } });
    return { message: 'Level deleted successfully' };
  }
}