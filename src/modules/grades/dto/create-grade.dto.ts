import { IsString, IsNumber, IsMongoId, IsOptional, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsMongoId()
  student: string;

  @IsString()
  subject: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  term?: string;
}

