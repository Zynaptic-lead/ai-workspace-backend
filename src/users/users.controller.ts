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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    schoolId: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  create(@Body() dto: CreateUserDto, @Req() req: RequestWithUser) {
    return this.usersService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(req.user.schoolId);
  }

  @Get('pending')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  getPendingUsers(@Req() req: RequestWithUser) {
    return this.usersService.getPendingUsers(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.findOne(id, req.user.schoolId);
  }

  @Patch(':id/approve')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  approveUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.approveUser(
      id,
      req.user.schoolId,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/reject')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  rejectUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.rejectUser(
      id,
      req.user.schoolId,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.remove(id, req.user.schoolId);
  }
}