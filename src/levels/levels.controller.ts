import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string; };
}

@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  create(@Body() dto: CreateLevelDto, @Req() req: RequestWithUser) {
    return this.levelsService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  findAll(@Req() req: RequestWithUser) {
    return this.levelsService.findAll(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.levelsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLevelDto, @Req() req: RequestWithUser) {
    return this.levelsService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.levelsService.remove(id, req.user.schoolId);
  }
}