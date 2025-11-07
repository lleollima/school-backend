import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * GET /calendar
   * Get all events with optional filters
   */
  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEvents(@Query() filters: FilterEventDto) {
    return await this.calendarService.getEvents(filters);
  }

  /**
   * POST /calendar
   * Create a new event
   * Only admins and teachers can create events
   */
  @Post()
  @Roles('admin', 'teacher')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: any,
  ) {
    return await this.calendarService.createEvent(createEventDto, user.userId);
  }

  /**
   * GET /calendar/upcoming
   * Get upcoming events
   */
  @Get('upcoming')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getUpcomingEvents(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 10;
    return await this.calendarService.getUpcomingEvents(limitNumber);
  }

  /**
   * GET /calendar/month/:year/:month
   * Get events for a specific month
   */
  @Get('month/:year/:month')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEventsByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return await this.calendarService.getEventsByMonth(
      parseInt(year),
      parseInt(month),
    );
  }

  /**
   * GET /calendar/type/:type
   * Get events by type
   */
  @Get('type/:type')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEventsByType(@Param('type') type: string) {
    return await this.calendarService.getEventsByType(type);
  }

  /**
   * GET /calendar/holidays
   * Get all holidays
   */
  @Get('holidays')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getHolidays(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : undefined;
    return await this.calendarService.getHolidays(yearNumber);
  }

  /**
   * GET /calendar/exams
   * Get all exams
   */
  @Get('exams')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getExams(@Query('classId') classId?: string) {
    return await this.calendarService.getExams(classId);
  }

  /**
   * GET /calendar/class/:classId
   * Get events for a specific class
   */
  @Get('class/:classId')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEventsForClass(@Param('classId') classId: string) {
    return await this.calendarService.getEventsForClass(classId);
  }

  /**
   * GET /calendar/user/:userId
   * Get events for a specific user
   */
  @Get('user/:userId')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEventsForUser(@Param('userId') userId: string) {
    return await this.calendarService.getEventsForUser(userId);
  }

  /**
   * GET /calendar/stats
   * Get event statistics
   */
  @Get('stats')
  @Roles('admin', 'teacher')
  async getEventStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.calendarService.getEventStats(start, end);
  }

  /**
   * GET /calendar/:id
   * Get a specific event by ID
   */
  @Get(':id')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getEventById(@Param('id') id: string) {
    return await this.calendarService.getEventById(id);
  }

  /**
   * PATCH /calendar/:id
   * Update an event
   * Only admins and teachers can update events
   */
  @Patch(':id')
  @Roles('admin', 'teacher')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.calendarService.updateEvent(id, updateEventDto);
  }

  /**
   * DELETE /calendar/:id
   * Delete an event
   * Only admins can delete events
   */
  @Delete(':id')
  @Roles('admin')
  async deleteEvent(@Param('id') id: string) {
    await this.calendarService.deleteEvent(id);
    return { message: 'Event deleted successfully' };
  }

  /**
   * POST /calendar/recurring
   * Generate recurring events
   * Only admins and teachers can create recurring events
   */
  @Post('recurring')
  @Roles('admin', 'teacher')
  async generateRecurringEvents(
    @Body() data: { event: CreateEventDto; occurrences: number },
  ) {
    return await this.calendarService.generateRecurringEvents(
      data.event,
      data.occurrences,
    );
  }

  /**
   * POST /calendar/check-conflicts
   * Check for conflicting events
   */
  @Post('check-conflicts')
  @Roles('admin', 'teacher')
  async checkConflicts(
    @Body()
    data: {
      date: string;
      startTime: string;
      endTime: string;
      excludeEventId?: string;
    },
  ) {
    return await this.calendarService.checkConflicts(
      new Date(data.date),
      data.startTime,
      data.endTime,
      data.excludeEventId,
    );
  }
}

