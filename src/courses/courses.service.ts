import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto, schoolId: string) {
    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        code: dto.code,
        description: dto.description,
        units: dto.units || 2,
        schoolId,
        departmentId: dto.departmentId,
        levelId: dto.levelId,
        sessionId: dto.sessionId,
        teacherId: dto.teacherId,
      },
      include: {
        department: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true, email: true } },
      },
    });

    return { message: 'Course created successfully', course };
  }

  async findAll(schoolId: string) {
    const courses = await this.prisma.course.findMany({
      where: { schoolId },
      include: {
        department: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
        _count: {
          select: { enrollments: true, assignments: true, materials: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { courses };
  }

  async findOne(id: string, schoolId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, schoolId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        level: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true, email: true } },
        enrollments: {
          include: {
            student: { select: { id: true, fullName: true, email: true } },
          },
        },
        materials: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return { course };
  }

  async update(id: string, dto: UpdateCourseDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const course = await this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        department: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
      },
    });

    return { message: 'Course updated successfully', course };
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  // ==================== ENROLL STUDENT ====================
  async enrollStudent(courseId: string, studentId: string, schoolId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, schoolId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const student = await this.prisma.user.findFirst({
      where: { id: studentId, schoolId, role: 'STUDENT' },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (existing) {
      return { message: 'Student already enrolled', enrollment: existing };
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        sessionId: course.sessionId,
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true, code: true } },
      },
    });

    return { message: 'Student enrolled successfully', enrollment };
  }

  // ==================== UNENROLL STUDENT ====================
  async unenrollStudent(courseId: string, studentId: string, schoolId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return { message: 'Student unenrolled successfully' };
  }

  // ==================== GET COURSE STUDENTS ====================
  async getCourseStudents(courseId: string, schoolId: string) {
    await this.findOne(courseId, schoolId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, level: true },
        },
      },
    });

    return { students: enrollments.map((e) => e.student) };
  }
}