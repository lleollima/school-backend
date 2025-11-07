import { IsMongoId, IsEnum, IsDateString, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class MarkAttendanceDto {
  @IsMongoId()
  student: string;

  @IsDateString()
  date: string;

  @IsEnum(['present', 'absent', 'late', 'excused'])
  status: 'present' | 'absent' | 'late' | 'excused';

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

