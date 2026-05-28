import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('schools')
  @Roles(Role.SUPER_ADMIN)
  getAllSchools() {
    return this.adminService.getAllSchools();
  }

  @Get('schools/pending')
  @Roles(Role.SUPER_ADMIN)
  getPendingSchools() {
    return this.adminService.getPendingSchools();
  }

  @Patch('schools/:id/approve')
  @Roles(Role.SUPER_ADMIN)
  approveSchool(@Param('id') id: string) {
    return this.adminService.approveSchool(id);
  }

  @Patch('schools/:id/reject')
  @Roles(Role.SUPER_ADMIN)
  rejectSchool(@Param('id') id: string) {
    return this.adminService.rejectSchool(id);
  }

  @Delete('schools/:id')
  @Roles(Role.SUPER_ADMIN)
  deleteSchool(@Param('id') id: string) {
    return this.adminService.deleteSchool(id);
  }
}