import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto, schoolId: string) {
    const session = await this.prisma.academicSession.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        schoolId,
      },
    });

    return { message: 'Session created successfully', session };
  }

  async findAll(schoolId: string) {
    const sessions = await this.prisma.academicSession.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });

    return { sessions };
  }

  async findOne(id: string, schoolId: string) {
    const session = await this.prisma.academicSession.findFirst({
      where: { id, schoolId },
      include: {
        levels: true,
        courses: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return { session };
  }

  async update(id: string, dto: UpdateSessionDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const session = await this.prisma.academicSession.update({
      where: { id },
      data,
    });

    return { message: 'Session updated successfully', session };
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.academicSession.delete({ where: { id } });
    return { message: 'Session deleted successfully' };
  }
}