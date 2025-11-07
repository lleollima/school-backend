import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { FilterPaymentDto } from './dto/filter-payment.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Create a new payment record
   */
  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = new this.paymentModel({
        ...dto,
        status: 'pending',
      });

      // Auto-update status if due date has passed
      const today = new Date();
      const dueDate = new Date(dto.dueDate);

      if (dueDate < today) {
        payment.status = 'late';
      }

      return await payment.save();
    } catch (error) {
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * Create multiple payments (bulk)
   */
  async createBulkPayments(payments: CreatePaymentDto[]): Promise<Payment[]> {
    const results = [];
    for (const paymentDto of payments) {
      const payment = await this.createPayment(paymentDto);
      results.push(payment);
    }
    return results;
  }

  /**
   * Get payments with optional filters
   */
  async getPayments(filters?: FilterPaymentDto): Promise<Payment[]> {
    const query: any = {};

    if (filters?.student) {
      query.student = filters.student;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      query.dueDate = {};
      if (filters.startDate) {
        query.dueDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.dueDate.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.referenceMonth) {
      query.referenceMonth = filters.referenceMonth;
    }

    if (filters?.referenceYear) {
      query.referenceYear = parseInt(filters.referenceYear);
    }

    const sortField = filters?.sortBy || 'dueDate';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    return await this.paymentModel
      .find(query)
      .populate('student', 'name email')
      .populate('processedBy', 'name')
      .sort({ [sortField]: sortOrder })
      .exec();
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('student', 'name email')
      .populate('processedBy', 'name')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get payments by student
   */
  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    return await this.paymentModel
      .find({ student: studentId })
      .populate('student', 'name email')
      .sort({ dueDate: -1 })
      .exec();
  }

  /**
   * Update payment status and details
   */
  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentDto,
    userId?: string,
  ): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // If marking as paid, set payment date if not provided
    if (dto.status === 'paid' && !dto.paymentDate) {
      dto.paymentDate = new Date().toISOString();
    }

    // Update fields
    Object.assign(payment, dto);

    if (userId) {
      payment.processedBy = userId as any;
    }

    return await payment.save();
  }

  /**
   * Mark payment as paid
   */
  async markAsPaid(
    id: string,
    paymentMethod: string,
    transactionId?: string,
    userId?: string,
  ): Promise<Payment> {
    return await this.updatePaymentStatus(
      id,
      {
        status: 'paid',
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod as any,
        transactionId,
      },
      userId,
    );
  }

  /**
   * Calculate late fees
   */
  calculateLateFees(
    amount: number,
    dueDate: Date,
    paymentDate: Date = new Date(),
  ): { fine: number; interest: number; total: number } {
    const daysLate = Math.floor(
      (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLate <= 0) {
      return { fine: 0, interest: 0, total: amount };
    }

    // 2% fine + 1% interest per month (0.033% per day)
    const fine = amount * 0.02;
    const interest = amount * (daysLate * 0.00033);
    const total = amount + fine + interest;

    return {
      fine: parseFloat(fine.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  /**
   * Update overdue payments
   */
  async updateOverduePayments(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.paymentModel.updateMany(
      {
        status: { $in: ['pending', 'late'] },
        dueDate: { $lt: today },
      },
      {
        $set: { status: 'overdue' },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Get financial statistics
   */
  async getFinancialStats(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.dueDate = {};
      if (startDate) matchStage.dueDate.$gte = new Date(startDate);
      if (endDate) matchStage.dueDate.$lte = new Date(endDate);
    }

    const stats = await this.paymentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    const result = {
      total: 0,
      totalAmount: 0,
      pending: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      late: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result.totalAmount += stat.totalAmount;
      result[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount,
      };
    });

    return result;
  }

  /**
   * Get revenue by month
   */
  async getRevenueByMonth(year: number): Promise<any[]> {
    return await this.paymentModel.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get pending payments by student
   */
  async getPendingPaymentsByStudent(studentId: string): Promise<any> {
    const payments = await this.paymentModel.find({
      student: studentId,
      status: { $in: ['pending', 'late', 'overdue'] },
    });

    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      payments,
      count: payments.length,
      totalAmount: total,
    };
  }

  /**
   * Delete payment
   */
  async deletePayment(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  /**
   * Generate monthly payments for a student (helper for automation)
   */
  async generateMonthlyPayments(
    studentId: string,
    amount: number,
    startMonth: string, // Format: YYYY-MM
    numberOfMonths: number,
    dayOfMonth: number = 10, // Due day of month
  ): Promise<Payment[]> {
    const payments: CreatePaymentDto[] = [];
    const [year, month] = startMonth.split('-').map(Number);

    for (let i = 0; i < numberOfMonths; i++) {
      const referenceDate = new Date(year, month - 1 + i, 1);
      const dueDate = new Date(year, month - 1 + i, dayOfMonth);

      payments.push({
        student: studentId,
        amount,
        dueDate: dueDate.toISOString(),
        description: `Mensalidade - ${referenceDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
        type: 'tuition',
        referenceMonth: `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`,
        referenceYear: referenceDate.getFullYear(),
      });
    }

    return await this.createBulkPayments(payments);
  }

  /**
   * Process Pix payment (placeholder for future integration)
   */
  async processPixPayment(paymentId: string, pixData: any): Promise<Payment> {
    // TODO: Integrate with Pix API
    // This is a placeholder for future Pix integration

    return await this.updatePaymentStatus(paymentId, {
      status: 'paid',
      paymentDate: new Date().toISOString(),
      paymentMethod: 'pix',
      transactionId: pixData.transactionId || `PIX-${Date.now()}`,
    });
  }

  /**
   * Process MercadoPago payment (placeholder for future integration)
   */
  async processMercadoPagoPayment(
    paymentId: string,
    mercadoPagoData: any,
  ): Promise<Payment> {
    // TODO: Integrate with MercadoPago API
    // This is a placeholder for future MercadoPago integration

    return await this.updatePaymentStatus(paymentId, {
      status: 'paid',
      paymentDate: new Date().toISOString(),
      paymentMethod: mercadoPagoData.paymentMethod || 'credit_card',
      transactionId: mercadoPagoData.id || `MP-${Date.now()}`,
    });
  }
}

