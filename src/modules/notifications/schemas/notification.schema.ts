import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  recipient: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    enum: ['email', 'push', 'whatsapp', 'sms'],
    required: true
  })
  type: string;

  @Prop({
    enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
    default: 'pending'
  })
  status: string;

  @Prop({
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  })
  priority: string;

  @Prop()
  subject?: string; // For emails

  @Prop()
  phoneNumber?: string; // For SMS/WhatsApp

  @Prop()
  emailAddress?: string; // For emails

  @Prop()
  metadata?: Map<string, any>; // Additional data

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sentBy?: User;

  @Prop()
  sentAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount?: number;

  @Prop()
  scheduledFor?: Date; // For scheduled notifications

  @Prop({ default: false })
  isScheduled?: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices para melhorar performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ scheduledFor: 1 });

