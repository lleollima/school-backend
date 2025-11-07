import { IsString, IsPhoneNumber, IsOptional, IsMongoId } from 'class-validator';

export class SendWhatsAppDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

