import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendPushDto } from './dto/send-push.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications/email
   * Send email notification
   * Only admins and teachers can send emails
   */
  @Post('email')
  @Roles('admin', 'teacher')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return await this.notificationsService.sendEmail(sendEmailDto);
  }

  /**
   * POST /notifications/push
   * Send push notification
   * Only admins and teachers can send push notifications
   */
  @Post('push')
  @Roles('admin', 'teacher')
  async sendPush(@Body() sendPushDto: SendPushDto) {
    return await this.notificationsService.sendPush(sendPushDto);
  }

  /**
   * POST /notifications/whatsapp
   * Send WhatsApp notification
   * Only admins can send WhatsApp messages
   */
  @Post('whatsapp')
  @Roles('admin')
  async sendWhatsApp(@Body() sendWhatsAppDto: SendWhatsAppDto) {
    return await this.notificationsService.sendWhatsApp(sendWhatsAppDto);
  }

  /**
   * GET /notifications/me
   * Get current user's notifications
   */
  @Get('me')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getMyNotifications(@CurrentUser() user: any) {
    return await this.notificationsService.getUserNotifications(user.userId);
  }

  /**
   * GET /notifications/me/unread-count
   * Get unread notifications count for current user
   */
  @Get('me/unread-count')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read
   * Mark notification as read
   */
  @Patch(':id/read')
  @Roles('admin', 'teacher', 'student', 'parent')
  async markAsRead(@Param('id') id: string) {
    return await this.notificationsService.markAsRead(id);
  }

  /**
   * PATCH /notifications/me/read-all
   * Mark all notifications as read for current user
   */
  @Patch('me/read-all')
  @Roles('admin', 'teacher', 'student', 'parent')
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { message: 'All notifications marked as read' };
  }

  /**
   * DELETE /notifications/:id
   * Delete a notification
   */
  @Delete(':id')
  @Roles('admin', 'teacher', 'student', 'parent')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(id);
    return { message: 'Notification deleted successfully' };
  }

  /**
   * POST /notifications/bulk
   * Send bulk notifications
   * Only admins can send bulk notifications
   */
  @Post('bulk')
  @Roles('admin')
  async sendBulkNotifications(
    @Body()
    data: {
      userIds: string[];
      title: string;
      message: string;
      type?: 'email' | 'push' | 'whatsapp';
    },
  ) {
    return await this.notificationsService.sendBulkNotifications(
      data.userIds,
      data.title,
      data.message,
      data.type,
    );
  }

  /**
   * GET /notifications/stats
   * Get notification statistics
   * Only admins can view statistics
   */
  @Get('stats')
  @Roles('admin')
  async getNotificationStats() {
    return await this.notificationsService.getNotificationStats();
  }

  /**
   * POST /notifications/payment/overdue
   * Send overdue payment notification
   * Only admins can send payment notifications
   */
  @Post('payment/overdue')
  @Roles('admin')
  async sendOverduePaymentNotification(
    @Body() data: { userId: string; paymentDetails: any },
  ) {
    return await this.notificationsService.sendOverduePaymentNotification(
      data.userId,
      data.paymentDetails,
    );
  }

  /**
   * POST /notifications/payment/upcoming
   * Send upcoming payment notification
   * Only admins can send payment notifications
   */
  @Post('payment/upcoming')
  @Roles('admin')
  async sendUpcomingPaymentNotification(
    @Body() data: { userId: string; paymentDetails: any },
  ) {
    return await this.notificationsService.sendUpcomingPaymentNotification(
      data.userId,
      data.paymentDetails,
    );
  }

  /**
   * POST /notifications/attendance/low
   * Send low attendance notification
   * Only admins and teachers can send attendance notifications
   */
  @Post('attendance/low')
  @Roles('admin', 'teacher')
  async sendLowAttendanceNotification(
    @Body() data: { userId: string; attendanceRate: number },
  ) {
    return await this.notificationsService.sendLowAttendanceNotification(
      data.userId,
      data.attendanceRate,
    );
  }

  /**
   * POST /notifications/grade/new
   * Send new grade notification
   * Only admins and teachers can send grade notifications
   */
  @Post('grade/new')
  @Roles('admin', 'teacher')
  async sendNewGradeNotification(
    @Body() data: { userId: string; gradeDetails: any },
  ) {
    return await this.notificationsService.sendNewGradeNotification(
      data.userId,
      data.gradeDetails,
    );
  }

  /**
   * POST /notifications/event/reminder
   * Send event reminder notification
   * Only admins and teachers can send event reminders
   */
  @Post('event/reminder')
  @Roles('admin', 'teacher')
  async sendEventReminderNotification(
    @Body() data: { userId: string; eventDetails: any },
  ) {
    return await this.notificationsService.sendEventReminderNotification(
      data.userId,
      data.eventDetails,
    );
  }
}

