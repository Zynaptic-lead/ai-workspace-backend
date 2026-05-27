import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CloudinaryService } from '../common/services/cloudinary.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string };
}

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  create(@Body() dto: CreateMaterialDto, @Req() req: RequestWithUser) {
    return this.materialsService.create(dto, req.user.id, req.user.schoolId);
  }

  @Post('upload')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('title') title: string,
    @Body('courseId') courseId: string,
    @Body('description') description: string,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!title) throw new BadRequestException('Title is required');
    if (!courseId) throw new BadRequestException('Course ID is required');

    const fileUrl = await this.cloudinaryService.uploadFile(
      file,
      `schools/${req.user.schoolId}/materials`,
    );

    return this.materialsService.create(
      { title, courseId, description, fileUrl },
      req.user.id,
      req.user.schoolId,
    );
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findAll(@Query('courseId') courseId: string, @Req() req: RequestWithUser) {
    return this.materialsService.findAll(req.user.schoolId, courseId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.materialsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @Req() req: RequestWithUser,
  ) {
    return this.materialsService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.materialsService.remove(id, req.user.schoolId);
  }
}