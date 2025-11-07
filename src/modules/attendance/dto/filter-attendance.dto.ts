import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export class FilterAttendanceDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['present', 'absent', 'late', 'excused'])
  status?: 'present' | 'absent' | 'late' | 'excused';

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'status';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

