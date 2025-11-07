import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * POST /attendance/:classId
   * Mark attendance for a student in a class
   * Only teachers and admins can mark attendance
   */
  @Post(':classId')
  @Roles('teacher', 'admin')
  async markAttendance(
    @Param('classId') classId: string,
    @Body() markAttendanceDto: MarkAttendanceDto,
    @CurrentUser() user: any,
  ) {
    return await this.attendanceService.markAttendance(
      classId,
      markAttendanceDto,
      user.userId,
    );
  }

  /**
   * POST /attendance/:classId/bulk
   * Mark attendance for multiple students at once
   * Only teachers and admins can mark attendance
   */
  @Post(':classId/bulk')
  @Roles('teacher', 'admin')
  async markBulkAttendance(
    @Param('classId') classId: string,
    @Body() attendanceList: MarkAttendanceDto[],
    @CurrentUser() user: any,
  ) {
    return await this.attendanceService.markBulkAttendance(
      classId,
      attendanceList,
      user.userId,
    );
  }

  /**
   * GET /attendance/student/:studentId
   * Get attendance records for a specific student
   * Students can see their own attendance, teachers and admins can see all
   */
  @Get('student/:studentId')
  @Roles('student', 'teacher', 'admin', 'parent')
  async getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() filters: FilterAttendanceDto,
  ) {
    return await this.attendanceService.getStudentAttendance(studentId, filters);
  }

  /**
   * GET /attendance/student/:studentId/stats
   * Get attendance statistics for a student
   */
  @Get('student/:studentId/stats')
  @Roles('student', 'teacher', 'admin', 'parent')
  async getStudentAttendanceStats(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.attendanceService.getStudentAttendanceStats(
      studentId,
      startDate,
      endDate,
    );
  }

  /**
   * GET /attendance/class/:classId/date/:date
   * Get attendance for a class on a specific date
   * Only teachers and admins can view class attendance
   */
  @Get('class/:classId/date/:date')
  @Roles('teacher', 'admin')
  async getClassAttendanceByDate(
    @Param('classId') classId: string,
    @Param('date') date: string,
  ) {
    return await this.attendanceService.getClassAttendanceByDate(classId, date);
  }

  /**
   * GET /attendance/class/:classId
   * Get attendance records for a class with optional filters
   * Only teachers and admins can view class attendance
   */
  @Get('class/:classId')
  @Roles('teacher', 'admin')
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query() filters: FilterAttendanceDto,
  ) {
    return await this.attendanceService.getClassAttendance(classId, filters);
  }

  /**
   * GET /attendance/class/:classId/stats/:date
   * Get attendance statistics for a class on a specific date
   */
  @Get('class/:classId/stats/:date')
  @Roles('teacher', 'admin')
  async getClassAttendanceStats(
    @Param('classId') classId: string,
    @Param('date') date: string,
  ) {
    return await this.attendanceService.getClassAttendanceStats(classId, date);
  }

  /**
   * DELETE /attendance/:id
   * Delete an attendance record
   * Only admins can delete attendance records
   */
  @Delete(':id')
  @Roles('admin')
  async deleteAttendance(@Param('id') id: string) {
    await this.attendanceService.deleteAttendance(id);
    return { message: 'Attendance record deleted successfully' };
  }

  // TODO: Future feature - Location-based attendance verification
  // @Post(':classId/verify-location')
  // @Roles('student', 'teacher', 'admin')
  // async verifyLocation(
  //   @Param('classId') classId: string,
  //   @Body() locationData: { latitude: number; longitude: number },
  // ) {
  //   const schoolLocation = { latitude: 0, longitude: 0 }; // Get from config
  //   const isValid = await this.attendanceService.verifyLocationAttendance(
  //     classId,
  //     locationData,
  //     schoolLocation,
  //   );
  //   return { valid: isValid, message: isValid ? 'Location verified' : 'Too far from school' };
  // }
}

