import { IsOptional, IsString, IsNumber, IsMongoId } from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  teacher?: string;

  @IsOptional()
  @IsNumber()
  year?: number;
}

