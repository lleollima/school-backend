import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  /**
   * Mark attendance for a student in a class
   */
  async markAttendance(
    classId: string,
    dto: MarkAttendanceDto,
    markedBy?: string,
  ): Promise<Attendance> {
    try {
      // Normalize date to start of day (remove time component)
      const attendanceDate = new Date(dto.date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Check if attendance already exists for this student, class, and date
      const existingAttendance = await this.attendanceModel.findOne({
        student: dto.student,
        class: classId,
        date: attendanceDate,
      });

      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = dto.status;
        if (dto.latitude !== undefined) existingAttendance.latitude = dto.latitude;
        if (dto.longitude !== undefined) existingAttendance.longitude = dto.longitude;
        if (dto.notes) existingAttendance.notes = dto.notes;
        if (markedBy) existingAttendance.markedBy = markedBy as any;

        return await existingAttendance.save();
      }

      // Create new attendance record
      const attendance = new this.attendanceModel({
        student: dto.student,
        class: classId,
        date: attendanceDate,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
        notes: dto.notes,
        markedBy: markedBy,
      });

      return await attendance.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Attendance already exists for this date');
      }
      throw new BadRequestException('Failed to mark attendance');
    }
  }

  /**
   * Mark attendance for multiple students at once
   */
  async markBulkAttendance(
    classId: string,
    attendanceList: MarkAttendanceDto[],
    markedBy?: string,
  ): Promise<Attendance[]> {
    const results = [];
    for (const dto of attendanceList) {
      const attendance = await this.markAttendance(classId, dto, markedBy);
      results.push(attendance);
    }
    return results;
  }

  /**
   * Get attendance records for a student with optional filters
   */
  async getStudentAttendance(
    studentId: string,
    filters?: FilterAttendanceDto,
  ): Promise<Attendance[]> {
    const query: any = { student: studentId };

    // Apply filters
    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.classId) {
      query.class = filters.classId;
    }

    // Sorting
    const sortField = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    return await this.attendanceModel
      .find(query)
      .populate('student', 'name email')
      .populate('class', 'name year')
      .populate('markedBy', 'name')
      .sort({ [sortField]: sortOrder })
      .exec();
  }

  /**
   * Get attendance records for a class on a specific date
   */
  async getClassAttendanceByDate(
    classId: string,
    date: string,
  ): Promise<Attendance[]> {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    return await this.attendanceModel
      .find({
        class: classId,
        date: attendanceDate,
      })
      .populate('student', 'name email')
      .populate('markedBy', 'name')
      .sort({ 'student.name': 1 })
      .exec();
  }

  /**
   * Get attendance records for a class with optional date range
   */
  async getClassAttendance(
    classId: string,
    filters?: FilterAttendanceDto,
  ): Promise<Attendance[]> {
    const query: any = { class: classId };

    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const sortField = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    return await this.attendanceModel
      .find(query)
      .populate('student', 'name email')
      .populate('markedBy', 'name')
      .sort({ [sortField]: sortOrder })
      .exec();
  }

  /**
   * Get attendance statistics for a student
   */
  async getStudentAttendanceStats(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const matchStage: any = { student: studentId };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await this.attendanceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRecords = await this.attendanceModel.countDocuments(matchStage);

    const result = {
      total: totalRecords,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    // Calculate attendance rate (present + late + excused)
    if (result.total > 0) {
      result.attendanceRate = parseFloat(
        (((result.present + result.late + result.excused) / result.total) * 100).toFixed(2),
      );
    }

    return result;
  }

  /**
   * Get attendance statistics for a class
   */
  async getClassAttendanceStats(
    classId: string,
    date: string,
  ): Promise<any> {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const stats = await this.attendanceModel.aggregate([
      {
        $match: {
          class: classId,
          date: attendanceDate,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      date: attendanceDate,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string): Promise<void> {
    const result = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
  }

  /**
   * Verify location-based attendance (future feature)
   */
  async verifyLocationAttendance(
    classId: string,
    studentLocation: { latitude: number; longitude: number },
    schoolLocation: { latitude: number; longitude: number },
    maxDistance: number = 100, // meters
  ): Promise<boolean> {
    // Calculate distance between two coordinates using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (studentLocation.latitude * Math.PI) / 180;
    const φ2 = (schoolLocation.latitude * Math.PI) / 180;
    const Δφ = ((schoolLocation.latitude - studentLocation.latitude) * Math.PI) / 180;
    const Δλ = ((schoolLocation.longitude - studentLocation.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters

    return distance <= maxDistance;
  }
}

