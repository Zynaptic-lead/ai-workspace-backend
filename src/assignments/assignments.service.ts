import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== CREATE ASSIGNMENT ====================
  async create(dto: CreateAssignmentDto, teacherId: string, schoolId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, schoolId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        totalPoints: dto.totalPoints || 100,
        courseId: dto.courseId,
        teacherId,
        schoolId,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
      },
    });

    // Notify all enrolled students
    await this.notificationsService.sendToCourseStudents(
      'New Assignment',
      `"${dto.title}" has been posted for ${course.title}. Due: ${dto.dueDate ? new Date(dto.dueDate).toLocaleDateString() : 'No deadline'}`,
      'ASSIGNMENT',
      dto.courseId,
      schoolId,
    );

    return { message: 'Assignment created successfully', assignment };
  }

  // ==================== GET ALL ASSIGNMENTS ====================
  async findAll(schoolId: string, userId: string, role: string) {
    let assignments;

    if (role === 'STUDENT') {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: userId },
        select: { courseId: true },
      });

      const courseIds = enrollments.map((e) => e.courseId);

      assignments = await this.prisma.assignment.findMany({
        where: {
          schoolId,
          courseId: { in: courseIds },
        },
        include: {
          course: { select: { id: true, title: true, code: true } },
          teacher: { select: { id: true, fullName: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      assignments = await this.prisma.assignment.findMany({
        where: { schoolId },
        include: {
          course: { select: { id: true, title: true, code: true } },
          teacher: { select: { id: true, fullName: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return { assignments };
  }

  // ==================== GET ONE ASSIGNMENT ====================
  async findOne(id: string, schoolId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, schoolId },
      include: {
        course: { select: { id: true, title: true, code: true } },
        teacher: { select: { id: true, fullName: true } },
        submissions: {
          include: {
            student: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return { assignment };
  }

  // ==================== UPDATE ASSIGNMENT ====================
  async update(id: string, dto: UpdateAssignmentDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    const assignment = await this.prisma.assignment.update({
      where: { id },
      data,
    });

    return { message: 'Assignment updated successfully', assignment };
  }

  // ==================== DELETE ASSIGNMENT ====================
  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);
    await this.prisma.assignment.delete({ where: { id } });
    return { message: 'Assignment deleted successfully' };
  }

  // ==================== SUBMIT ASSIGNMENT ====================
  async submit(
    assignmentId: string,
    dto: SubmitAssignmentDto,
    studentId: string,
    schoolId: string,
  ) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, schoolId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You are not enrolled in this course. Enroll first before submitting.',
      );
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      throw new ForbiddenException('Assignment due date has passed');
    }

    const existing = await this.prisma.submission.findFirst({
      where: { assignmentId, studentId },
    });

    let submission;

    if (existing) {
      submission = await this.prisma.submission.update({
        where: { id: existing.id },
        data: {
          content: dto.content,
          fileUrl: dto.fileUrl,
          status: 'SUBMITTED',
        },
      });
    } else {
      submission = await this.prisma.submission.create({
        data: {
          content: dto.content,
          fileUrl: dto.fileUrl,
          status: 'SUBMITTED',
          assignmentId,
          studentId,
          schoolId,
        },
      });
    }

    // Notify teacher
    if (assignment.teacherId) {
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { fullName: true },
      });

      await this.notificationsService.create(
        'New Submission',
        `${student?.fullName || 'A student'} submitted "${assignment.title}"`,
        'SUBMISSION',
        schoolId,
        assignment.teacherId,
      );
    }

    return {
      message: existing ? 'Submission updated successfully' : 'Assignment submitted successfully',
      submission,
    };
  }

  // ==================== GRADE SUBMISSION ====================
  async gradeSubmission(
    submissionId: string,
    dto: GradeSubmissionDto,
    schoolId: string,
  ) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, schoolId },
      include: {
        assignment: { select: { id: true, title: true, totalPoints: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        status: 'GRADED',
        gradedAt: new Date(),
      },
      include: {
        student: { select: { id: true, fullName: true } },
        assignment: { select: { id: true, title: true, totalPoints: true } },
      },
    });

    // Notify student
    await this.notificationsService.create(
      'Assignment Graded',
      `"${submission.assignment?.title || 'Your assignment'}" has been graded. Score: ${dto.score}/${submission.assignment?.totalPoints || 100}`,
      'GRADE',
      schoolId,
      submission.studentId,
    );

    return { message: 'Submission graded successfully', submission: updated };
  }

  // ==================== GET MY SUBMISSIONS ====================
  async getMySubmissions(studentId: string, schoolId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: { studentId, schoolId },
      include: {
        assignment: {
          select: { id: true, title: true, totalPoints: true, dueDate: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return { submissions };
  }

  // ==================== GET SUBMISSIONS FOR ASSIGNMENT ====================
  async getSubmissionsForAssignment(assignmentId: string, schoolId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId, schoolId },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return { submissions };
  }
}