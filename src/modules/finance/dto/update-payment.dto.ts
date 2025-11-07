import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  Min
} from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'late', 'overdue', 'cancelled'])
  status?: 'pending' | 'paid' | 'late' | 'overdue' | 'cancelled';

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(['pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'other'])
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'check' | 'other';

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fine?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interest?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  invoiceUrl?: string;
}

