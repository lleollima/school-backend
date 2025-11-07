import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Class } from '../../classes/schemas/class.schema';

export type GradeDocument = Grade & Document;

@Schema({ timestamps: true })
export class Grade {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true })
  class: Class;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop()
  term: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);

