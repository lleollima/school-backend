import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async addGrade(classId: string, dto: CreateGradeDto): Promise<Grade> {
    try {
      const grade = new this.gradeModel({
        ...dto,
        class: classId,
      });
      return await grade.save();
    } catch (error) {
      throw new BadRequestException('Failed to create grade');
    }
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    return await this.gradeModel
      .find({ student: studentId })
      .populate('student', 'name email')
      .populate('class', 'name year')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getGradesByClass(classId: string): Promise<Grade[]> {
    return await this.gradeModel
      .find({ class: classId })
      .populate('student', 'name email')
      .populate('class', 'name year')
      .sort({ student: 1, subject: 1 })
      .exec();
  }

  async updateGrade(id: string, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('student', 'name email')
      .populate('class', 'name year')
      .exec();

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async deleteGrade(id: string): Promise<void> {
    const result = await this.gradeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
  }

  async getGradeById(id: string): Promise<Grade> {
    const grade = await this.gradeModel
      .findById(id)
      .populate('student', 'name email')
      .populate('class', 'name year')
      .exec();

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }
}

