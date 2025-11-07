import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsMongoId
} from 'class-validator';

export class FilterEventDto {
  @IsOptional()
  @IsEnum(['meeting', 'exam', 'holiday', 'class', 'event', 'deadline', 'other'])
  type?: 'meeting' | 'exam' | 'holiday' | 'class' | 'event' | 'deadline' | 'other';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsMongoId()
  classId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsEnum(['date', 'title', 'type', 'priority'])
  sortBy?: 'date' | 'title' | 'type' | 'priority';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

