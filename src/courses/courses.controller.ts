import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string; };
}

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  create(@Body() dto: CreateCourseDto, @Req() req: RequestWithUser) {
    return this.coursesService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findAll(@Req() req: RequestWithUser) {
    return this.coursesService.findAll(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.coursesService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req: RequestWithUser) {
    return this.coursesService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.coursesService.remove(id, req.user.schoolId);
  }

  @Post(':id/enroll/:studentId')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  enrollStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.enrollStudent(id, studentId, req.user.schoolId);
  }

  @Delete(':id/unenroll/:studentId')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  unenrollStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.unenrollStudent(id, studentId, req.user.schoolId);
  }

  @Get(':id/students')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  getCourseStudents(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.coursesService.getCourseStudents(id, req.user.schoolId);
  }
}