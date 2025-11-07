import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Class } from '../../classes/schemas/class.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true })
  class: Class;

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ['present', 'absent', 'late', 'excused'], required: true })
  status: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop()
  notes?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  markedBy?: User;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Index composto para evitar duplicatas (mesmo aluno, mesma turma, mesma data)
AttendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

