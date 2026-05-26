import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== SCHOOL ADMIN REGISTRATION ====================
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: { name: dto.schoolName },
      });

      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          password: hashedPassword,
          role: Role.SCHOOL_ADMIN,
          schoolId: school.id,
          accountStatus: 'ACTIVE',
        },
      });

      return { school, user };
    });

    const accessToken = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
      schoolId: result.user.schoolId,
    });

    return {
      message: 'School registered successfully',
      access_token: accessToken,
      school: {
        id: result.school.id,
        name: result.school.name,
      },
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
        accountStatus: result.user.accountStatus,
      },
    };
  }

  // ==================== STUDENT SELF-REGISTRATION ====================
  async registerStudent(dto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        role: Role.STUDENT,
        schoolId: dto.schoolId,
        accountStatus: 'PENDING',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registration submitted successfully. Waiting for school admin approval.',
      user,
    };
  }

  // ==================== TEACHER SELF-REGISTRATION ====================
  async registerTeacher(dto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        role: Role.TEACHER,
        schoolId: dto.schoolId,
        accountStatus: 'PENDING',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registration submitted successfully. Waiting for school admin approval.',
      user,
    };
  }

  // ==================== LOGIN ====================
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { school: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.accountStatus === 'PENDING') {
      throw new ForbiddenException(
        'Your account is pending approval. Please wait for the school admin to approve it.',
      );
    }

    if (user.accountStatus === 'REJECTED') {
      throw new ForbiddenException(
        'Your account has been rejected. Please contact the school admin.',
      );
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    });

    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        accountStatus: user.accountStatus,
        school: {
          id: user.school.id,
          name: user.school.name,
        },
      },
    };
  }
}