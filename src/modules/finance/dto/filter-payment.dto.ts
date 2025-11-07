import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  IsMongoId
} from 'class-validator';

export class FilterPaymentDto {
  @IsOptional()
  @IsMongoId()
  student?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'late', 'overdue', 'cancelled'])
  status?: 'pending' | 'paid' | 'late' | 'overdue' | 'cancelled';

  @IsOptional()
  @IsEnum(['tuition', 'registration', 'material', 'exam', 'activity', 'other'])
  type?: 'tuition' | 'registration' | 'material' | 'exam' | 'activity' | 'other';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  referenceMonth?: string; // Format: YYYY-MM

  @IsOptional()
  @IsString()
  referenceYear?: string;

  @IsOptional()
  @IsEnum(['dueDate', 'paymentDate', 'amount', 'createdAt'])
  sortBy?: 'dueDate' | 'paymentDate' | 'amount' | 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

