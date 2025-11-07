import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Class } from '../../classes/schemas/class.schema';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({
    enum: ['meeting', 'exam', 'holiday', 'class', 'event', 'deadline', 'other'],
    required: true
  })
  type: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  startTime?: string; // Format: HH:mm

  @Prop()
  endTime?: string; // Format: HH:mm

  @Prop()
  location?: string;

  @Prop({
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  priority?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy?: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  participants?: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }] })
  classes?: Class[];

  @Prop({ default: false })
  allDay?: boolean;

  @Prop({ default: false })
  isRecurring?: boolean;

  @Prop({
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  })
  recurrencePattern?: string;

  @Prop()
  recurrenceEndDate?: Date;

  @Prop()
  color?: string; // Hex color code for calendar display

  @Prop({ default: false })
  notificationSent?: boolean;

  @Prop()
  reminderMinutes?: number; // Minutes before event to send reminder
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Índices para melhorar performance
EventSchema.index({ date: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ date: 1, type: 1 });

