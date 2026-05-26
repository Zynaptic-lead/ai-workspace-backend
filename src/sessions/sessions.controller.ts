import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string; };
}

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  create(@Body() dto: CreateSessionDto, @Req() req: RequestWithUser) {
    return this.sessionsService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(@Req() req: RequestWithUser) {
    return this.sessionsService.findAll(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.sessionsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto, @Req() req: RequestWithUser) {
    return this.sessionsService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.sessionsService.remove(id, req.user.schoolId);
  }
}