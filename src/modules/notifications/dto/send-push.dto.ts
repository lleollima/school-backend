import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class SendPushDto {
  @IsMongoId()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  link?: string;
}

