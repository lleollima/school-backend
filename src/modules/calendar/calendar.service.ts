import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  /**
   * Create a new event
   */
  async createEvent(dto: CreateEventDto, userId?: string): Promise<Event> {
    try {
      const event = new this.eventModel({
        ...dto,
        createdBy: userId,
      });

      // Validate end date if provided
      if (dto.endDate && new Date(dto.endDate) < new Date(dto.date)) {
        throw new BadRequestException('End date cannot be before start date');
      }

      // Validate recurrence
      if (dto.isRecurring && !dto.recurrencePattern) {
        throw new BadRequestException('Recurrence pattern is required for recurring events');
      }

      return await event.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create event');
    }
  }

  /**
   * Get all events with optional filters
   */
  async getEvents(filters?: FilterEventDto): Promise<Event[]> {
    const query: any = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.classId) {
      query.classes = filters.classId;
    }

    if (filters?.userId) {
      query.participants = filters.userId;
    }

    const sortField = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    return await this.eventModel
      .find(query)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .sort({ [sortField]: sortOrder })
      .exec();
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Get events by month
   */
  async getEventsByMonth(year: number, month: number): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return await this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const now = new Date();

    return await this.eventModel
      .find({
        date: { $gte: now },
      })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: string): Promise<Event[]> {
    return await this.eventModel
      .find({ type })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Update event
   */
  async updateEvent(id: string, dto: UpdateEventDto): Promise<Event> {
    // Validate dates if both are being updated
    if (dto.date && dto.endDate) {
      if (new Date(dto.endDate) < new Date(dto.date)) {
        throw new BadRequestException('End date cannot be before start date');
      }
    }

    const event = await this.eventModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .populate('classes', 'name year')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  /**
   * Get events for a specific class
   */
  async getEventsForClass(classId: string): Promise<Event[]> {
    return await this.eventModel
      .find({ classes: classId })
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Get events for a specific user (as participant)
   */
  async getEventsForUser(userId: string): Promise<Event[]> {
    return await this.eventModel
      .find({ participants: userId })
      .populate('createdBy', 'name email')
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Get holidays
   */
  async getHolidays(year?: number): Promise<Event[]> {
    const query: any = { type: 'holiday' };

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    return await this.eventModel
      .find(query)
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Get exams
   */
  async getExams(classId?: string): Promise<Event[]> {
    const query: any = { type: 'exam' };

    if (classId) {
      query.classes = classId;
    }

    return await this.eventModel
      .find(query)
      .populate('classes', 'name year')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Check for conflicting events
   */
  async checkConflicts(
    date: Date,
    startTime: string,
    endTime: string,
    excludeEventId?: string,
  ): Promise<Event[]> {
    const query: any = {
      date: date,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    };

    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }

    return await this.eventModel.find(query).exec();
  }

  /**
   * Get event statistics
   */
  async getEventStats(startDate?: Date, endDate?: Date): Promise<any> {
    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    const stats = await this.eventModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: any = {
      total: 0,
      meeting: 0,
      exam: 0,
      holiday: 0,
      class: 0,
      event: 0,
      deadline: 0,
      other: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }

  /**
   * Generate recurring events (helper method)
   */
  async generateRecurringEvents(
    baseEvent: CreateEventDto,
    occurrences: number,
  ): Promise<Event[]> {
    if (!baseEvent.isRecurring || !baseEvent.recurrencePattern) {
      throw new BadRequestException('Event must be recurring');
    }

    const events: Event[] = [];
    const startDate = new Date(baseEvent.date);

    for (let i = 0; i < occurrences; i++) {
      const eventDate = new Date(startDate);

      switch (baseEvent.recurrencePattern) {
        case 'daily':
          eventDate.setDate(startDate.getDate() + i);
          break;
        case 'weekly':
          eventDate.setDate(startDate.getDate() + i * 7);
          break;
        case 'monthly':
          eventDate.setMonth(startDate.getMonth() + i);
          break;
        case 'yearly':
          eventDate.setFullYear(startDate.getFullYear() + i);
          break;
      }

      // Check if we've passed the recurrence end date
      if (baseEvent.recurrenceEndDate && eventDate > new Date(baseEvent.recurrenceEndDate)) {
        break;
      }

      const event = await this.createEvent({
        ...baseEvent,
        date: eventDate.toISOString(),
      });

      events.push(event);
    }

    return events;
  }
}

