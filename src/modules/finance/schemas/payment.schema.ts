import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: User;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    enum: ['pending', 'paid', 'late', 'overdue', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop()
  paymentDate?: Date;

  @Prop()
  description?: string;

  @Prop({
    enum: ['tuition', 'registration', 'material', 'exam', 'activity', 'other'],
    default: 'tuition'
  })
  type: string;

  @Prop()
  referenceMonth?: string; // Format: YYYY-MM

  @Prop()
  referenceYear?: number;

  @Prop({
    enum: ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'other'],
  })
  paymentMethod?: string;

  @Prop()
  transactionId?: string; // ID da transação (Pix, MercadoPago, etc)

  @Prop()
  discount?: number;

  @Prop()
  fine?: number; // Multa por atraso

  @Prop()
  interest?: number; // Juros

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  processedBy?: User;

  @Prop()
  notes?: string;

  @Prop()
  invoiceUrl?: string; // URL do boleto/fatura

  @Prop({ default: false })
  notificationSent?: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Índices para melhorar performance
PaymentSchema.index({ student: 1, dueDate: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ referenceMonth: 1, referenceYear: 1 });

