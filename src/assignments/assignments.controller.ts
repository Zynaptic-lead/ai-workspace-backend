import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CloudinaryService } from '../common/services/cloudinary.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string };
}

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  create(@Body() dto: CreateAssignmentDto, @Req() req: RequestWithUser) {
    return this.assignmentsService.create(dto, req.user.id, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findAll(@Req() req: RequestWithUser) {
    return this.assignmentsService.findAll(
      req.user.schoolId,
      req.user.id,
      req.user.role,
    );
  }

  @Get('my-submissions')
  @Roles(Role.STUDENT)
  getMySubmissions(@Req() req: RequestWithUser) {
    return this.assignmentsService.getMySubmissions(
      req.user.id,
      req.user.schoolId,
    );
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.assignmentsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.assignmentsService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.assignmentsService.remove(id, req.user.schoolId);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitAssignmentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.assignmentsService.submit(
      id,
      dto,
      req.user.id,
      req.user.schoolId,
    );
  }

  @Post(':id/submit/file')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file'))
  async submitFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileUrl = await this.cloudinaryService.uploadFile(
      file,
      `schools/${req.user.schoolId}/submissions`,
    );

    return this.assignmentsService.submit(
      id,
      { fileUrl },
      req.user.id,
      req.user.schoolId,
    );
  }

  @Get(':id/submissions')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  getSubmissions(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.assignmentsService.getSubmissionsForAssignment(
      id,
      req.user.schoolId,
    );
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      dto,
      req.user.schoolId,
    );
  }
}