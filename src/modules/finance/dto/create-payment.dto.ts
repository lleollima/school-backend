import {
  IsMongoId,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Max,
  IsInt
} from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  student: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['tuition', 'registration', 'material', 'exam', 'activity', 'other'])
  type?: 'tuition' | 'registration' | 'material' | 'exam' | 'activity' | 'other';

  @IsOptional()
  @IsString()
  referenceMonth?: string; // Format: YYYY-MM

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  referenceYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

