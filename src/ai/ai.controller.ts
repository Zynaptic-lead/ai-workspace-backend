import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; schoolId: string };
}

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  async summarize(
    @Body('content') content: string,
  ) {
    if (!content || content.length < 50) {
      return {
        error: 'Please provide at least 50 characters of content to summarize.',
      };
    }
    return this.aiService.summarizeNotes(content);
  }

  @Post('quiz')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  async generateQuiz(
    @Body('content') content: string,
    @Body('numberOfQuestions') numberOfQuestions?: number,
  ) {
    if (!content || content.length < 50) {
      return {
        error: 'Please provide at least 50 characters of content to generate a quiz.',
      };
    }
    return this.aiService.generateQuiz(content, numberOfQuestions || 5);
  }

  @Post('assist')
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  async studyAssistant(
    @Body('question') question: string,
    @Body('context') context?: string,
  ) {
    if (!question || question.trim().length === 0) {
      return {
        error: 'Please provide a question.',
      };
    }
    return this.aiService.studyAssistant(question, context);
  }
}