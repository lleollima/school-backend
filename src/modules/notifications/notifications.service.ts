import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { SendEmailDto } from './dto/send-email.dto';
import { SendPushDto } from './dto/send-push.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Send email notification
   */
  async sendEmail(dto: SendEmailDto): Promise<Notification> {
    try {
      // Create notification record
      const notification = new this.notificationModel({
        recipient: dto.userId,
        title: dto.subject,
        message: dto.body,
        type: 'email',
        subject: dto.subject,
        emailAddress: dto.to,
        status: 'pending',
      });

      await notification.save();

      // TODO: Integrate with email service (Nodemailer, SendGrid, etc.)
      // For now, we'll simulate email sending
      this.logger.log(`Sending email to ${dto.to}: ${dto.subject}`);

      // Simulate email sending
      await this.simulateEmailSending(dto);

      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(`Email sent successfully to ${dto.to}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPush(dto: SendPushDto): Promise<Notification> {
    try {
      // Create notification record
      const notification = new this.notificationModel({
        recipient: dto.userId,
        title: dto.title,
        message: dto.message,
        type: 'push',
        status: 'pending',
        metadata: {
          icon: dto.icon,
          link: dto.link,
        },
      });

      await notification.save();

      // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
      this.logger.log(`Sending push notification to user ${dto.userId}: ${dto.title}`);

      // Simulate push notification
      await this.simulatePushNotification(dto);

      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(`Push notification sent successfully to user ${dto.userId}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${dto.userId}:`, error);
      throw error;
    }
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(dto: SendWhatsAppDto): Promise<Notification> {
    try {
      // Create notification record
      const notification = new this.notificationModel({
        recipient: dto.userId,
        title: 'WhatsApp Message',
        message: dto.message,
        type: 'whatsapp',
        phoneNumber: dto.phone,
        status: 'pending',
        metadata: {
          mediaUrl: dto.mediaUrl,
        },
      });

      await notification.save();

      // TODO: Integrate with WhatsApp Business API or Twilio
      this.logger.log(`Sending WhatsApp to ${dto.phone}: ${dto.message}`);

      // Simulate WhatsApp sending
      await this.simulateWhatsAppSending(dto);

      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(`WhatsApp sent successfully to ${dto.phone}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${dto.phone}:`, error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel
      .countDocuments({
        recipient: userId,
        status: { $ne: 'read' },
      })
      .exec();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return await this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        {
          status: 'read',
          readAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        {
          recipient: userId,
          status: { $ne: 'read' },
        },
        {
          status: 'read',
          readAt: new Date(),
        },
      )
      .exec();
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId).exec();
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: 'email' | 'push' | 'whatsapp' = 'push',
  ): Promise<Notification[]> {
    const notifications = [];

    for (const userId of userIds) {
      const notification = new this.notificationModel({
        recipient: userId,
        title,
        message,
        type,
        status: 'sent',
        sentAt: new Date(),
      });

      await notification.save();
      notifications.push(notification);
    }

    this.logger.log(`Sent ${notifications.length} bulk notifications`);
    return notifications;
  }

  /**
   * Send notification about overdue payment
   */
  async sendOverduePaymentNotification(
    userId: string,
    paymentDetails: any,
  ): Promise<Notification> {
    const message = `Você possui um pagamento vencido no valor de R$ ${paymentDetails.amount}. Vencimento: ${new Date(paymentDetails.dueDate).toLocaleDateString('pt-BR')}`;

    return await this.sendPush({
      userId,
      title: 'Pagamento Vencido',
      message,
    });
  }

  /**
   * Send notification about upcoming payment
   */
  async sendUpcomingPaymentNotification(
    userId: string,
    paymentDetails: any,
  ): Promise<Notification> {
    const daysUntilDue = Math.ceil(
      (new Date(paymentDetails.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    const message = `Você tem um pagamento de R$ ${paymentDetails.amount} vencendo em ${daysUntilDue} dia(s).`;

    return await this.sendPush({
      userId,
      title: 'Lembrete de Pagamento',
      message,
    });
  }

  /**
   * Send notification about low attendance
   */
  async sendLowAttendanceNotification(
    userId: string,
    attendanceRate: number,
  ): Promise<Notification> {
    const message = `Atenção! Sua frequência está em ${attendanceRate}%. É necessário manter pelo menos 75% de presença.`;

    return await this.sendPush({
      userId,
      title: 'Alerta de Frequência',
      message,
    });
  }

  /**
   * Send notification about new grade
   */
  async sendNewGradeNotification(
    userId: string,
    gradeDetails: any,
  ): Promise<Notification> {
    const message = `Nova nota lançada em ${gradeDetails.subject}: ${gradeDetails.score}`;

    return await this.sendPush({
      userId,
      title: 'Nova Nota',
      message,
    });
  }

  /**
   * Send notification about upcoming event
   */
  async sendEventReminderNotification(
    userId: string,
    eventDetails: any,
  ): Promise<Notification> {
    const message = `Lembrete: ${eventDetails.title} em ${new Date(eventDetails.date).toLocaleDateString('pt-BR')}`;

    return await this.sendPush({
      userId,
      title: 'Lembrete de Evento',
      message,
    });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<any> {
    const stats = await this.notificationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: any = {
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      read: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }

  // Simulation methods (to be replaced with real integrations)

  private async simulateEmailSending(dto: SendEmailDto): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.debug(`[SIMULATED] Email sent to ${dto.to}`);
        resolve();
      }, 1000);
    });
  }

  private async simulatePushNotification(dto: SendPushDto): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.debug(`[SIMULATED] Push notification sent to user ${dto.userId}`);
        resolve();
      }, 500);
    });
  }

  private async simulateWhatsAppSending(dto: SendWhatsAppDto): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.debug(`[SIMULATED] WhatsApp sent to ${dto.phone}`);
        resolve();
      }, 1000);
    });
  }
}

