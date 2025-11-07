import { IsEnum, IsOptional, IsNumberString } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsEnum(['admin', 'teacher', 'parent', 'student'])
  role?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

