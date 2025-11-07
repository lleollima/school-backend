# Finance Module (Módulo Financeiro) 💰

Module for managing student payments, tuition fees, and financial operations.

## Features

- ✅ Create and manage payment records
- ✅ Bulk payment creation
- ✅ Track payment status (pending, paid, late, overdue)
- ✅ Multiple payment types (tuition, registration, materials, etc.)
- ✅ Automatic late fee calculation
- ✅ Financial statistics and reports
- ✅ Revenue tracking by month
- ✅ Student payment history
- ✅ Automatic overdue status updates
- 🔮 Future: Pix integration
- 🔮 Future: MercadoPago integration

## Schema

### Payment
```typescript
{
  student: ObjectId (ref: User) - The student
  amount: number - Payment amount
  dueDate: Date - Payment due date
  status: enum - Payment status
  paymentDate: Date (optional) - Actual payment date
  description: string (optional) - Payment description
  type: enum - Payment type
  referenceMonth: string (optional) - Reference month (YYYY-MM)
  referenceYear: number (optional) - Reference year
  paymentMethod: enum (optional) - Payment method used
  transactionId: string (optional) - Transaction ID
  discount: number (optional) - Discount applied
  fine: number (optional) - Late payment fine
  interest: number (optional) - Interest for late payment
  processedBy: ObjectId (ref: User) - Who processed the payment
  notes: string (optional) - Additional notes
  invoiceUrl: string (optional) - Invoice/receipt URL
  notificationSent: boolean - Notification status
}
```

### Payment Status Options
- `pending` - Payment is pending
- `paid` - Payment has been paid
- `late` - Payment is late but not yet overdue
- `overdue` - Payment is significantly overdue
- `cancelled` - Payment was cancelled

### Payment Type Options
- `tuition` - Monthly tuition fee
- `registration` - Registration/enrollment fee
- `material` - School materials
- `exam` - Exam fees
- `activity` - Extracurricular activities
- `other` - Other fees

### Payment Method Options
- `pix` - Pix (Brazilian instant payment)
- `credit_card` - Credit card
- `debit_card` - Debit card
- `bank_transfer` - Bank transfer
- `cash` - Cash
- `check` - Check
- `other` - Other methods

## API Endpoints

### GET /finance/payments
Get all payments with optional filters.

**Authorization:** Admin, Teacher

**Query Parameters:**
- `student` (optional): Filter by student ID
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `referenceMonth` (optional): Filter by reference month
- `referenceYear` (optional): Filter by reference year
- `sortBy` (optional): Sort field
- `sortOrder` (optional): asc or desc

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef1",
    "student": {
      "_id": "64f5a9b1234567890abcdef2",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "amount": 500.00,
    "dueDate": "2024-01-10T00:00:00.000Z",
    "status": "paid",
    "paymentDate": "2024-01-08T10:30:00.000Z",
    "type": "tuition",
    "referenceMonth": "2024-01",
    "paymentMethod": "pix",
    "transactionId": "PIX-123456789"
  }
]
```

### POST /finance/payments
Create a new payment record.

**Authorization:** Admin

**Request Body:**
```json
{
  "student": "64f5a9b1234567890abcdef1",
  "amount": 500.00,
  "dueDate": "2024-02-10",
  "description": "Mensalidade - Fevereiro 2024",
  "type": "tuition",
  "referenceMonth": "2024-02",
  "referenceYear": 2024
}
```

### POST /finance/payments/bulk
Create multiple payments at once.

**Authorization:** Admin

**Request Body:**
```json
[
  {
    "student": "64f5a9b1234567890abcdef1",
    "amount": 500.00,
    "dueDate": "2024-01-10",
    "type": "tuition"
  },
  {
    "student": "64f5a9b1234567890abcdef1",
    "amount": 500.00,
    "dueDate": "2024-02-10",
    "type": "tuition"
  }
]
```

### GET /finance/payments/:id
Get a specific payment by ID.

**Authorization:** Admin, Teacher, Student, Parent

### PATCH /finance/payments/:id
Update payment status and details.

**Authorization:** Admin

**Request Body:**
```json
{
  "status": "paid",
  "paymentDate": "2024-01-08",
  "paymentMethod": "pix",
  "transactionId": "PIX-123456789"
}
```

### POST /finance/payments/:id/pay
Mark payment as paid.

**Authorization:** Admin

**Request Body:**
```json
{
  "paymentMethod": "pix",
  "transactionId": "PIX-123456789"
}
```

### DELETE /finance/payments/:id
Delete a payment record.

**Authorization:** Admin

### GET /finance/student/:studentId
Get all payments for a specific student.

**Authorization:** Admin, Teacher, Student (own), Parent

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef1",
    "amount": 500.00,
    "dueDate": "2024-01-10T00:00:00.000Z",
    "status": "paid",
    "type": "tuition"
  }
]
```

### GET /finance/student/:studentId/pending
Get pending payments for a student.

**Authorization:** Admin, Teacher, Student, Parent

**Response:**
```json
{
  "payments": [
    {
      "_id": "64f5a9b1234567890abcdef1",
      "amount": 500.00,
      "dueDate": "2024-02-10T00:00:00.000Z",
      "status": "pending",
      "type": "tuition"
    }
  ],
  "count": 1,
  "totalAmount": 500.00
}
```

### GET /finance/stats
Get financial statistics.

**Authorization:** Admin

**Query Parameters:**
- `startDate` (optional): Start date for stats
- `endDate` (optional): End date for stats

**Response:**
```json
{
  "total": 150,
  "totalAmount": 75000.00,
  "pending": {
    "count": 30,
    "amount": 15000.00
  },
  "paid": {
    "count": 100,
    "amount": 50000.00
  },
  "late": {
    "count": 15,
    "amount": 7500.00
  },
  "overdue": {
    "count": 5,
    "amount": 2500.00
  }
}
```

### GET /finance/revenue/:year
Get revenue by month for a specific year.

**Authorization:** Admin

**Response:**
```json
[
  {
    "_id": 1,
    "revenue": 50000.00,
    "count": 100
  },
  {
    "_id": 2,
    "revenue": 48000.00,
    "count": 96
  }
]
```

### POST /finance/overdue/update
Update overdue payments status.

**Authorization:** Admin

**Response:**
```json
{
  "message": "Overdue payments updated successfully",
  "updatedCount": 15
}
```

### POST /finance/generate-monthly
Generate monthly payments for a student.

**Authorization:** Admin

**Request Body:**
```json
{
  "studentId": "64f5a9b1234567890abcdef1",
  "amount": 500.00,
  "startMonth": "2024-01",
  "numberOfMonths": 12,
  "dayOfMonth": 10
}
```

**Response:**
```json
[
  {
    "_id": "...",
    "amount": 500.00,
    "dueDate": "2024-01-10",
    "type": "tuition"
  }
  // ... 11 more months
]
```

### POST /finance/late-fees/:id
Calculate late fees for a payment.

**Authorization:** Admin

**Request Body:**
```json
{
  "paymentDate": "2024-01-20"
}
```

**Response:**
```json
{
  "payment": { /* payment details */ },
  "fees": {
    "fine": 10.00,
    "interest": 5.00,
    "total": 515.00
  }
}
```

## Validation Rules

### CreatePaymentDto
- `student`: Required, valid MongoDB ObjectId
- `amount`: Required, number >= 0
- `dueDate`: Required, ISO date string
- `description`: Optional, string
- `type`: Optional, enum (tuition, registration, etc.)
- `referenceMonth`: Optional, string (YYYY-MM format)
- `referenceYear`: Optional, integer (2020-2100)
- `discount`: Optional, number >= 0
- `notes`: Optional, string

### UpdatePaymentDto
- `status`: Optional, enum (pending, paid, late, overdue, cancelled)
- `paymentDate`: Optional, ISO date string
- `paymentMethod`: Optional, enum (pix, credit_card, etc.)
- `transactionId`: Optional, string
- `discount`: Optional, number >= 0
- `fine`: Optional, number >= 0
- `interest`: Optional, number >= 0
- `notes`: Optional, string
- `invoiceUrl`: Optional, string

## Features

### Automatic Late Fee Calculation
The module includes a method to calculate late fees:
- **Fine**: 2% of the amount
- **Interest**: 1% per month (0.033% per day)

```typescript
const fees = calculateLateFees(500, dueDate, paymentDate);
// Returns: { fine: 10, interest: 5, total: 515 }
```

### Automatic Status Updates
- Payments created with past due dates are automatically marked as `late`
- Use `/finance/overdue/update` to update `late` payments to `overdue`

### Bulk Payment Generation
Generate multiple monthly payments automatically:
```typescript
generateMonthlyPayments(studentId, 500, "2024-01", 12, 10);
// Creates 12 monthly payments of R$ 500, due on the 10th of each month
```

## Role-Based Access Control

| Role | View Payments | Create Payment | Update Payment | Delete Payment | View Stats |
|------|---------------|----------------|----------------|----------------|------------|
| Student | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Teacher | ✅ (all) | ❌ | ❌ | ❌ | ❌ |
| Parent | ✅ (child's) | ❌ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Future Integrations

### Pix Integration 🇧🇷
Planned feature for Pix payment processing:
- Generate Pix QR Code
- Pix payment verification
- Automatic status update on payment confirmation
- Webhook integration

### MercadoPago Integration 💳
Planned feature for MercadoPago:
- Payment link generation
- Credit/debit card processing
- Boleto generation
- Webhook for payment notifications

## Usage Examples

```typescript
// In another service
constructor(private financeService: FinanceService) {}

// Create monthly tuition payments
async createTuitionForYear(studentId: string) {
  return await this.financeService.generateMonthlyPayments(
    studentId,
    500,
    '2024-01',
    12,
    10
  );
}

// Check student debts
async getStudentDebts(studentId: string) {
  return await this.financeService.getPendingPaymentsByStudent(studentId);
}

// Process a payment
async processPayment(paymentId: string) {
  return await this.financeService.markAsPaid(
    paymentId,
    'pix',
    'PIX-123456789'
  );
}
```

## Error Handling

The module handles the following errors:
- `400 Bad Request`: Invalid data or failed to create payment
- `404 Not Found`: Payment not found
- `401 Unauthorized`: No authentication token
- `403 Forbidden`: Insufficient permissions

## Database Indexes

- Composite index: `(student, dueDate)` - For student payment lookups
- Index: `status` - For filtering by payment status
- Composite index: `(referenceMonth, referenceYear)` - For monthly reports

## Best Practices

1. **Use bulk operations** - More efficient for creating multiple payments
2. **Generate monthly payments** - Automate recurring tuition creation
3. **Regular overdue updates** - Run `/finance/overdue/update` daily via cron
4. **Track transaction IDs** - Always store payment gateway transaction IDs
5. **Calculate fees before payment** - Show total with fees to users
6. **Keep audit trail** - processedBy field tracks who updated payments

## Testing

Test the endpoints using the finance.http file:

```http
### Create payment
POST http://localhost:3000/finance/payments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "student": "64f5a9b1234567890abcdef1",
  "amount": 500.00,
  "dueDate": "2024-02-10",
  "type": "tuition"
}
```

