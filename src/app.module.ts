import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CoursesModule } from './courses/courses.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { MaterialsModule } from './materials/materials.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { SessionsModule } from './sessions/sessions.module';
import { DepartmentsModule } from './departments/departments.module';
import { LevelsModule } from './levels/levels.module';
import { CommonModule } from './common/common.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    SessionsModule,
    DepartmentsModule,
    LevelsModule,
    CoursesModule,
    AssignmentsModule,
    SubmissionsModule,
    MaterialsModule,
    NotificationsModule,
    AiModule,
    AdminModule,
  ],
})
export class AppModule {}