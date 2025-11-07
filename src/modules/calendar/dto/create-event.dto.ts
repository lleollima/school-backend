import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsInt,
  Min,
  Matches
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsEnum(['meeting', 'exam', 'holiday', 'class', 'event', 'deadline', 'other'])
  type: 'meeting' | 'exam' | 'holiday' | 'class' | 'event' | 'deadline' | 'other';

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in format HH:mm'
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in format HH:mm'
  })
  endTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participants?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  classes?: string[];

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g., #FF5733)'
  })
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reminderMinutes?: number;
}

