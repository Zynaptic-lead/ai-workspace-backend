import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string; };
}

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  create(@Body() dto: CreateDepartmentDto, @Req() req: RequestWithUser) {
    return this.departmentsService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(@Req() req: RequestWithUser) {
    return this.departmentsService.findAll(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.departmentsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto, @Req() req: RequestWithUser) {
    return this.departmentsService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.departmentsService.remove(id, req.user.schoolId);
  }

  @Patch(':id/head/:headId')
  @Roles(Role.SCHOOL_ADMIN)
  setHead(
    @Param('id') id: string,
    @Param('headId') headId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.departmentsService.setHead(id, headId, req.user.schoolId);
  }
}