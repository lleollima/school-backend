import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createClass(createClassDto: CreateClassDto): Promise<Class> {
    // Verificar se o professor existe e tem a role correta
    if (createClassDto.teacher) {
      const teacher = await this.userModel.findById(createClassDto.teacher);
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      if (teacher.role !== 'teacher') {
        throw new BadRequestException('User is not a teacher');
      }
    }

    const newClass = new this.classModel(createClassDto);
    const savedClass = await newClass.save();

    return this.classModel
      .findById(savedClass._id)
      .populate('teacher')
      .populate('students')
      .exec();
  }

  async getAllClasses(): Promise<Class[]> {
    return this.classModel
      .find()
      .populate('teacher')
      .populate('students')
      .exec();
  }

  async getClassById(id: string): Promise<Class> {
    const classEntity = await this.classModel
      .findById(id)
      .populate('teacher')
      .populate('students')
      .exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async updateClass(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    // Verificar se o professor existe e tem a role correta
    if (updateClassDto.teacher) {
      const teacher = await this.userModel.findById(updateClassDto.teacher);
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      if (teacher.role !== 'teacher') {
        throw new BadRequestException('User is not a teacher');
      }
    }

    const updatedClass = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true })
      .populate('teacher')
      .populate('students')
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return updatedClass;
  }

  async assignTeacher(classId: string, teacherId: string): Promise<Class> {
    // Verificar se o professor existe e tem a role correta
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    if (teacher.role !== 'teacher') {
      throw new BadRequestException('User is not a teacher');
    }

    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        classId,
        { teacher: teacherId },
        { new: true }
      )
      .populate('teacher')
      .populate('students')
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    return updatedClass;
  }

  async addStudent(classId: string, studentId: string): Promise<Class> {
    // Verificar se o estudante existe e tem a role correta
    const student = await this.userModel.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.role !== 'student') {
      throw new BadRequestException('User is not a student');
    }

    // Verificar se a turma existe
    const classEntity = await this.classModel.findById(classId);
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Verificar se o estudante já está na turma
    if (classEntity.students.includes(studentId as any)) {
      throw new BadRequestException('Student already enrolled in this class');
    }

    return this.classModel
      .findByIdAndUpdate(
        classId,
        { $push: { students: studentId } },
        { new: true }
      )
      .populate('teacher')
      .populate('students')
      .exec();
  }

  async removeStudent(classId: string, studentId: string): Promise<Class> {
    const result = await this.classModel
      .findByIdAndUpdate(
        classId,
        { $pull: { students: studentId } },
        { new: true }
      )
      .populate('teacher')
      .populate('students')
      .exec();

    if (!result) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    return result;
  }

  async deleteClass(id: string): Promise<void> {
    const result = await this.classModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
  }
}

