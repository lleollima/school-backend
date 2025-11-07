import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * GET /finance/payments
   * Get all payments with optional filters
   * Only admins and finance staff can view all payments
   */
  @Get('payments')
  @Roles('admin', 'teacher')
  async getPayments(@Query() filters: FilterPaymentDto) {
    return await this.financeService.getPayments(filters);
  }

  /**
   * POST /finance/payments
   * Create a new payment record
   * Only admins can create payments
   */
  @Post('payments')
  @Roles('admin')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.financeService.createPayment(createPaymentDto);
  }

  /**
   * POST /finance/payments/bulk
   * Create multiple payments at once
   * Only admins can create bulk payments
   */
  @Post('payments/bulk')
  @Roles('admin')
  async createBulkPayments(@Body() payments: CreatePaymentDto[]) {
    return await this.financeService.createBulkPayments(payments);
  }

  /**
   * GET /finance/payments/:id
   * Get a specific payment by ID
   */
  @Get('payments/:id')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getPaymentById(@Param('id') id: string) {
    return await this.financeService.getPaymentById(id);
  }

  /**
   * PATCH /finance/payments/:id
   * Update payment status and details
   * Only admins can update payments
   */
  @Patch('payments/:id')
  @Roles('admin')
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return await this.financeService.updatePaymentStatus(
      id,
      updatePaymentDto,
      user.userId,
    );
  }

  /**
   * POST /finance/payments/:id/pay
   * Mark payment as paid
   * Only admins can mark payments as paid
   */
  @Post('payments/:id/pay')
  @Roles('admin')
  async markAsPaid(
    @Param('id') id: string,
    @Body() data: { paymentMethod: string; transactionId?: string },
    @CurrentUser() user: any,
  ) {
    return await this.financeService.markAsPaid(
      id,
      data.paymentMethod,
      data.transactionId,
      user.userId,
    );
  }

  /**
   * DELETE /finance/payments/:id
   * Delete a payment record
   * Only admins can delete payments
   */
  @Delete('payments/:id')
  @Roles('admin')
  async deletePayment(@Param('id') id: string) {
    await this.financeService.deletePayment(id);
    return { message: 'Payment deleted successfully' };
  }

  /**
   * GET /finance/student/:studentId
   * Get all payments for a specific student
   * Students can see their own payments
   */
  @Get('student/:studentId')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getPaymentsByStudent(@Param('studentId') studentId: string) {
    return await this.financeService.getPaymentsByStudent(studentId);
  }

  /**
   * GET /finance/student/:studentId/pending
   * Get pending payments for a student
   */
  @Get('student/:studentId/pending')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getPendingPayments(@Param('studentId') studentId: string) {
    return await this.financeService.getPendingPaymentsByStudent(studentId);
  }

  /**
   * GET /finance/stats
   * Get financial statistics
   * Only admins can view statistics
   */
  @Get('stats')
  @Roles('admin')
  async getFinancialStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.financeService.getFinancialStats(startDate, endDate);
  }

  /**
   * GET /finance/revenue/:year
   * Get revenue by month for a specific year
   * Only admins can view revenue
   */
  @Get('revenue/:year')
  @Roles('admin')
  async getRevenueByMonth(@Param('year') year: string) {
    return await this.financeService.getRevenueByMonth(parseInt(year));
  }

  /**
   * POST /finance/overdue/update
   * Update overdue payments status
   * Only admins can update overdue status
   */
  @Post('overdue/update')
  @Roles('admin')
  async updateOverduePayments() {
    const count = await this.financeService.updateOverduePayments();
    return {
      message: 'Overdue payments updated successfully',
      updatedCount: count
    };
  }

  /**
   * POST /finance/generate-monthly
   * Generate monthly payments for a student
   * Only admins can generate payments
   */
  @Post('generate-monthly')
  @Roles('admin')
  async generateMonthlyPayments(
    @Body()
    data: {
      studentId: string;
      amount: number;
      startMonth: string;
      numberOfMonths: number;
      dayOfMonth?: number;
    },
  ) {
    return await this.financeService.generateMonthlyPayments(
      data.studentId,
      data.amount,
      data.startMonth,
      data.numberOfMonths,
      data.dayOfMonth,
    );
  }

  /**
   * POST /finance/late-fees/:id
   * Calculate late fees for a payment
   */
  @Post('late-fees/:id')
  @Roles('admin')
  async calculateLateFees(
    @Param('id') id: string,
    @Body() data: { paymentDate?: string },
  ) {
    const payment = await this.financeService.getPaymentById(id);
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    const fees = this.financeService.calculateLateFees(
      payment.amount,
      payment.dueDate,
      paymentDate,
    );

    return {
      payment,
      fees,
    };
  }

  // TODO: Future integrations

  // @Post('payments/:id/pix')
  // @Roles('admin', 'student', 'parent')
  // async processPixPayment(
  //   @Param('id') id: string,
  //   @Body() pixData: any,
  // ) {
  //   return await this.financeService.processPixPayment(id, pixData);
  // }

  // @Post('payments/:id/mercadopago')
  // @Roles('admin', 'student', 'parent')
  // async processMercadoPagoPayment(
  //   @Param('id') id: string,
  //   @Body() mercadoPagoData: any,
  // ) {
  //   return await this.financeService.processMercadoPagoPayment(id, mercadoPagoData);
  // }
}

