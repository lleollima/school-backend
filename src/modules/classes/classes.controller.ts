import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('admin', 'teacher')
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.classesService.createClass(createClassDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  async getAllClasses() {
    return this.classesService.getAllClasses();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  async getClassById(@Param('id') id: string) {
    return this.classesService.getClassById(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  async updateClass(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto
  ) {
    return this.classesService.updateClass(id, updateClassDto);
  }

  @Post(':id/teacher/:teacherId')
  @Roles('admin')
  async assignTeacher(
    @Param('id') classId: string,
    @Param('teacherId') teacherId: string
  ) {
    return this.classesService.assignTeacher(classId, teacherId);
  }

  @Post(':id/student/:studentId')
  @Roles('admin', 'teacher')
  async addStudent(
    @Param('id') classId: string,
    @Param('studentId') studentId: string
  ) {
    return this.classesService.addStudent(classId, studentId);
  }

  @Delete(':id/student/:studentId')
  @Roles('admin', 'teacher')
  async removeStudent(
    @Param('id') classId: string,
    @Param('studentId') studentId: string
  ) {
    return this.classesService.removeStudent(classId, studentId);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteClass(@Param('id') id: string) {
    return this.classesService.deleteClass(id);
  }
}

