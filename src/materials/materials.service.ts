import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto, uploadedById: string, schoolId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, schoolId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const material = await this.prisma.material.create({
      data: {
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
        type: dto.type || 'DOCUMENT',
        courseId: dto.courseId,
        uploadedById,
        schoolId,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        uploadedBy: { select: { id: true, fullName: true } },
      },
    });

    return { message: 'Material uploaded successfully', material };
  }

  async findAll(schoolId: string, courseId?: string) {
    const where: any = { schoolId };
    if (courseId) where.courseId = courseId;

    const materials = await this.prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, code: true } },
        uploadedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { materials };
  }

  async findOne(id: string, schoolId: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, schoolId },
      include: {
        course: { select: { id: true, title: true, code: true } },
        uploadedBy: { select: { id: true, fullName: true } },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return { material };
  }

  async update(id: string, dto: UpdateMaterialDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const material = await this.prisma.material.update({
      where: { id },
      data: dto,
    });

    return { message: 'Material updated successfully', material };
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.material.delete({ where: { id } });
    return { message: 'Material deleted successfully' };
  }
}