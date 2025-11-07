import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  teacher?: string;

  @IsNotEmpty()
  @IsNumber()
  year: number;
}

