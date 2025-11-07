# Notifications Module (Módulo de Notificações) 🔔

Module for managing and sending notifications via email, push, WhatsApp, and SMS.

## Features

- ✅ Send email notifications
- ✅ Send push notifications
- ✅ Send WhatsApp messages
- ✅ Bulk notifications
- ✅ Notification history
- ✅ Mark as read/unread
- ✅ Notification statistics
- ✅ Automated notifications for:
  - Overdue payments
  - Upcoming payments
  - Low attendance
  - New grades
  - Event reminders
- 🔮 Future: Email templates, scheduled notifications, SMS integration

## Schema

### Notification
```typescript
{
  recipient: ObjectId (ref: User) - Notification recipient
  title: string - Notification title
  message: string - Notification message
  type: enum - Notification type (email, push, whatsapp, sms)
  status: enum - Status (pending, sent, failed, delivered, read)
  priority: enum - Priority (info, warning, error, success)
  subject: string (optional) - Email subject
  phoneNumber: string (optional) - Phone number for SMS/WhatsApp
  emailAddress: string (optional) - Email address
  metadata: Map (optional) - Additional data
  sentBy: ObjectId (ref: User) - Who sent the notification
  sentAt: Date (optional) - When sent
  deliveredAt: Date (optional) - When delivered
  readAt: Date (optional) - When read
  errorMessage: string (optional) - Error message if failed
  retryCount: number - Number of retry attempts
  scheduledFor: Date (optional) - Scheduled delivery time
  isScheduled: boolean - Is scheduled flag
}
```

### Notification Types
- `email` - Email notification
- `push` - Push notification
- `whatsapp` - WhatsApp message
- `sms` - SMS message

### Status Options
- `pending` - Waiting to be sent
- `sent` - Successfully sent
- `failed` - Failed to send
- `delivered` - Delivered to recipient
- `read` - Read by recipient

### Priority Levels
- `info` - Informational
- `warning` - Warning
- `error` - Error
- `success` - Success

## API Endpoints

### POST /notifications/email
Send email notification.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Important Notice",
  "body": "This is an important message.",
  "html": "<p>This is an <strong>important</strong> message.</p>",
  "userId": "64f5a9b1234567890abcdef1"
}
```

**Response:**
```json
{
  "_id": "64f5a9b1234567890abcdef2",
  "recipient": "64f5a9b1234567890abcdef1",
  "title": "Important Notice",
  "message": "This is an important message.",
  "type": "email",
  "status": "sent",
  "emailAddress": "user@example.com",
  "sentAt": "2024-01-15T10:30:00.000Z"
}
```

### POST /notifications/push
Send push notification.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "title": "New Grade Available",
  "message": "Your grade for Mathematics has been posted",
  "icon": "grade",
  "link": "/grades/123"
}
```

### POST /notifications/whatsapp
Send WhatsApp message.

**Authorization:** Admin

**Request Body:**
```json
{
  "phone": "+5511999999999",
  "message": "Reminder: Payment due tomorrow",
  "userId": "64f5a9b1234567890abcdef1",
  "mediaUrl": "https://example.com/image.jpg"
}
```

### GET /notifications/me
Get current user's notifications.

**Authorization:** All authenticated users

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef2",
    "title": "New Grade Available",
    "message": "Your grade for Mathematics has been posted",
    "type": "push",
    "status": "sent",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /notifications/me/unread-count
Get unread notifications count.

**Authorization:** All authenticated users

**Response:**
```json
{
  "count": 5
}
```

### PATCH /notifications/:id/read
Mark notification as read.

**Authorization:** All authenticated users

### PATCH /notifications/me/read-all
Mark all notifications as read.

**Authorization:** All authenticated users

### DELETE /notifications/:id
Delete a notification.

**Authorization:** All authenticated users

### POST /notifications/bulk
Send bulk notifications.

**Authorization:** Admin

**Request Body:**
```json
{
  "userIds": ["id1", "id2", "id3"],
  "title": "Important Announcement",
  "message": "School will be closed tomorrow",
  "type": "push"
}
```

### GET /notifications/stats
Get notification statistics.

**Authorization:** Admin

**Response:**
```json
{
  "total": 1000,
  "pending": 50,
  "sent": 850,
  "failed": 20,
  "delivered": 800,
  "read": 600
}
```

## Automated Notifications

### POST /notifications/payment/overdue
Send overdue payment notification.

**Authorization:** Admin

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "paymentDetails": {
    "amount": 500,
    "dueDate": "2024-01-10"
  }
}
```

### POST /notifications/payment/upcoming
Send upcoming payment notification.

**Authorization:** Admin

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "paymentDetails": {
    "amount": 500,
    "dueDate": "2024-01-20"
  }
}
```

### POST /notifications/attendance/low
Send low attendance notification.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "attendanceRate": 65
}
```

### POST /notifications/grade/new
Send new grade notification.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "gradeDetails": {
    "subject": "Mathematics",
    "score": 85
  }
}
```

### POST /notifications/event/reminder
Send event reminder notification.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "userId": "64f5a9b1234567890abcdef1",
  "eventDetails": {
    "title": "Parent-Teacher Meeting",
    "date": "2024-01-20"
  }
}
```

## Role-Based Access Control

| Role | Send Email | Send Push | Send WhatsApp | View Own | Bulk Send |
|------|------------|-----------|---------------|----------|-----------|
| Student | ❌ | ❌ | ❌ | ✅ | ❌ |
| Teacher | ✅ | ✅ | ❌ | ✅ | ❌ |
| Parent | ❌ | ❌ | ❌ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Integration Placeholders

The module includes placeholder methods for future integrations:

### Email Integration
**Recommended Services:**
- Nodemailer (SMTP)
- SendGrid
- Amazon SES
- Mailgun

### Push Notifications
**Recommended Services:**
- Firebase Cloud Messaging (FCM)
- OneSignal
- Pusher
- Apple Push Notification Service (APNS)

### WhatsApp Integration
**Recommended Services:**
- Twilio WhatsApp API
- WhatsApp Business API
- MessageBird

### SMS Integration
**Recommended Services:**
- Twilio
- Amazon SNS
- Nexmo/Vonage

## Usage Examples

```typescript
// In another service
constructor(private notificationsService: NotificationsService) {}

// Send email
async sendWelcomeEmail(user: User) {
  return await this.notificationsService.sendEmail({
    to: user.email,
    subject: 'Welcome to School System',
    body: 'Welcome! Your account has been created.',
    userId: user.id
  });
}

// Send push notification
async notifyNewGrade(studentId: string, grade: Grade) {
  return await this.notificationsService.sendPush({
    userId: studentId,
    title: 'New Grade',
    message: `Grade posted: ${grade.subject} - ${grade.score}`,
  });
}

// Send bulk notifications
async notifyAllStudents(title: string, message: string) {
  const students = await this.userModel.find({ role: 'student' });
  const userIds = students.map(s => s.id);
  
  return await this.notificationsService.sendBulkNotifications(
    userIds,
    title,
    message,
    'push'
  );
}
```

## Automation Examples

### Daily Overdue Payment Check
```typescript
@Cron('0 9 * * *') // Every day at 9 AM
async checkOverduePayments() {
  const overduePayments = await this.financeService.getPayments({
    status: 'overdue'
  });

  for (const payment of overduePayments) {
    await this.notificationsService.sendOverduePaymentNotification(
      payment.student.id,
      payment
    );
  }
}
```

### Weekly Attendance Report
```typescript
@Cron('0 18 * * 5') // Every Friday at 6 PM
async sendWeeklyAttendanceReport() {
  const students = await this.userModel.find({ role: 'student' });

  for (const student of students) {
    const stats = await this.attendanceService.getStudentAttendanceStats(
      student.id
    );

    if (stats.attendanceRate < 75) {
      await this.notificationsService.sendLowAttendanceNotification(
        student.id,
        stats.attendanceRate
      );
    }
  }
}
```

## Database Indexes

- Composite index: `(recipient, createdAt)` - For user notification queries
- Index: `status` - For filtering by status
- Index: `type` - For filtering by type
- Index: `scheduledFor` - For scheduled notifications

## Error Handling

The module handles the following errors:
- `400 Bad Request`: Invalid data or validation errors
- `404 Not Found`: Notification not found
- `401 Unauthorized`: No authentication token
- `403 Forbidden`: Insufficient permissions
- Logs all notification failures for debugging

## Testing

Test the endpoints using the notifications.http file:

```http
### Send email
POST http://localhost:3000/notifications/email
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}
```

