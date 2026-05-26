import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const schools = await this.prisma.school.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        logo: true,
      },
    });

    return { schools };
  }
}