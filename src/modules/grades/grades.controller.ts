import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  /**
   * POST /grades/:classId
   * Add a new grade for a student in a class
   * Only teachers and admins can add grades
   */
  @Post(':classId')
  @Roles('teacher', 'admin')
  async addGrade(
    @Param('classId') classId: string,
    @Body() createGradeDto: CreateGradeDto,
  ) {
    return await this.gradesService.addGrade(classId, createGradeDto);
  }

  /**
   * GET /grades/student/:studentId
   * Get all grades for a specific student
   * Students can see their own grades, teachers and admins can see all
   */
  @Get('student/:studentId')
  @Roles('student', 'teacher', 'admin', 'parent')
  async getGradesByStudent(@Param('studentId') studentId: string) {
    return await this.gradesService.getGradesByStudent(studentId);
  }

  /**
   * GET /grades/class/:classId
   * Get all grades for a specific class
   * Only teachers and admins can view class grades
   */
  @Get('class/:classId')
  @Roles('teacher', 'admin')
  async getGradesByClass(@Param('classId') classId: string) {
    return await this.gradesService.getGradesByClass(classId);
  }

  /**
   * GET /grades/:id
   * Get a specific grade by ID
   */
  @Get(':id')
  @Roles('student', 'teacher', 'admin', 'parent')
  async getGradeById(@Param('id') id: string) {
    return await this.gradesService.getGradeById(id);
  }

  /**
   * PATCH /grades/:id
   * Update a grade
   * Only teachers and admins can update grades
   */
  @Patch(':id')
  @Roles('teacher', 'admin')
  async updateGrade(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return await this.gradesService.updateGrade(id, updateGradeDto);
  }

  /**
   * DELETE /grades/:id
   * Delete a grade
   * Only admins can delete grades
   */
  @Delete(':id')
  @Roles('admin')
  async deleteGrade(@Param('id') id: string) {
    await this.gradesService.deleteGrade(id);
    return { message: 'Grade deleted successfully' };
  }

  // TODO: Future feature - AI OCR Upload
  // @Post('ai-upload')
  // @Roles('teacher', 'admin')
  // async aiUpload(@Body() data: any) {
  //   // OCR IA implementation
  //   return { message: 'AI OCR feature coming soon' };
  // }
}

