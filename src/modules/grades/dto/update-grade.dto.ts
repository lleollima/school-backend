import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  term?: string;
}

