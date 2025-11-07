# Attendance Module (Módulo de Presenças) 📋

Module for managing student attendance tracking and statistics.

## Features

- ✅ Mark attendance for individual students
- ✅ Bulk attendance marking for entire class
- ✅ View attendance by student with filters
- ✅ View attendance by class and date
- ✅ Attendance statistics (rates, totals)
- ✅ Location tracking (GPS coordinates)
- ✅ Multiple attendance statuses
- 🔮 Future: Automatic location-based verification

## Schema

### Attendance
```typescript
{
  student: ObjectId (ref: User) - The student
  class: ObjectId (ref: Class) - The class
  date: Date - Attendance date (normalized to start of day)
  status: enum - Attendance status
  latitude: number (optional) - GPS latitude
  longitude: number (optional) - GPS longitude
  notes: string (optional) - Additional notes
  markedBy: ObjectId (ref: User) - Who marked the attendance
}
```

### Attendance Status Options
- `present` - Student is present
- `absent` - Student is absent
- `late` - Student arrived late
- `excused` - Excused absence

## API Endpoints

### POST /attendance/:classId
Mark attendance for a single student.

**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "student": "64f5a9b1234567890abcdef1",
  "date": "2024-01-15",
  "status": "present",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "notes": "Arrived on time"
}
```

**Response:**
```json
{
  "_id": "64f5a9b1234567890abcdef2",
  "student": {
    "_id": "64f5a9b1234567890abcdef1",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "class": {
    "_id": "64f5a9b1234567890abcdef3",
    "name": "Mathematics 101",
    "year": 2024
  },
  "date": "2024-01-15T00:00:00.000Z",
  "status": "present",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "notes": "Arrived on time",
  "markedBy": {
    "_id": "64f5a9b1234567890abcdef4",
    "name": "Prof. Maria"
  },
  "createdAt": "2024-01-15T08:30:00.000Z"
}
```

### POST /attendance/:classId/bulk
Mark attendance for multiple students at once.

**Authorization:** Teacher, Admin

**Request Body:**
```json
[
  {
    "student": "64f5a9b1234567890abcdef1",
    "date": "2024-01-15",
    "status": "present"
  },
  {
    "student": "64f5a9b1234567890abcdef2",
    "date": "2024-01-15",
    "status": "absent"
  },
  {
    "student": "64f5a9b1234567890abcdef3",
    "date": "2024-01-15",
    "status": "late"
  }
]
```

### GET /attendance/student/:studentId
Get attendance records for a specific student.

**Authorization:** Student (own records), Teacher, Admin, Parent

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `status` (optional): Filter by status
- `classId` (optional): Filter by class
- `sortBy` (optional): Sort field (date, status)
- `sortOrder` (optional): asc or desc

**Example:**
```
GET /attendance/student/64f5a9b1234567890abcdef1?startDate=2024-01-01&endDate=2024-01-31&status=absent
```

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef2",
    "student": {
      "_id": "64f5a9b1234567890abcdef1",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "class": {
      "_id": "64f5a9b1234567890abcdef3",
      "name": "Mathematics 101",
      "year": 2024
    },
    "date": "2024-01-15T00:00:00.000Z",
    "status": "present",
    "markedBy": {
      "_id": "64f5a9b1234567890abcdef4",
      "name": "Prof. Maria"
    }
  }
]
```

### GET /attendance/student/:studentId/stats
Get attendance statistics for a student.

**Authorization:** Student, Teacher, Admin, Parent

**Query Parameters:**
- `startDate` (optional): Start date for stats
- `endDate` (optional): End date for stats

**Response:**
```json
{
  "total": 20,
  "present": 15,
  "absent": 2,
  "late": 2,
  "excused": 1,
  "attendanceRate": 90.0
}
```

### GET /attendance/class/:classId/date/:date
Get attendance for a class on a specific date.

**Authorization:** Teacher, Admin

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef2",
    "student": {
      "_id": "64f5a9b1234567890abcdef1",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "status": "present",
    "markedBy": {
      "_id": "64f5a9b1234567890abcdef4",
      "name": "Prof. Maria"
    }
  }
]
```

### GET /attendance/class/:classId
Get attendance records for a class with filters.

**Authorization:** Teacher, Admin

**Query Parameters:** Same as student attendance

### GET /attendance/class/:classId/stats/:date
Get attendance statistics for a class on a specific date.

**Authorization:** Teacher, Admin

**Response:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "present": 25,
  "absent": 3,
  "late": 2,
  "excused": 0,
  "total": 30
}
```

### DELETE /attendance/:id
Delete an attendance record.

**Authorization:** Admin only

**Response:**
```json
{
  "message": "Attendance record deleted successfully"
}
```

## Validation Rules

### MarkAttendanceDto
- `student`: Required, must be a valid MongoDB ObjectId
- `date`: Required, must be a valid date string (ISO 8601)
- `status`: Required, must be one of: present, absent, late, excused
- `latitude`: Optional, number between -90 and 90
- `longitude`: Optional, number between -180 and 180
- `notes`: Optional, string

### FilterAttendanceDto
- `startDate`: Optional, ISO date string
- `endDate`: Optional, ISO date string
- `status`: Optional, must be one of: present, absent, late, excused
- `classId`: Optional, string
- `sortBy`: Optional, 'date' or 'status'
- `sortOrder`: Optional, 'asc' or 'desc'

## Features

### Automatic Duplicate Prevention
- Unique index on (student, class, date)
- If attendance already exists for the same student, class, and date, it will be updated instead of creating a duplicate

### Date Normalization
- All dates are normalized to start of day (00:00:00)
- This ensures consistent date comparison and prevents time-based duplicates

### GPS Location Tracking
- Optional latitude and longitude fields
- Validates coordinates within valid ranges
- Can be used for location-based attendance verification

### Bulk Operations
- Mark attendance for entire class at once
- Efficient for daily attendance taking
- Each record processed individually with error handling

### Statistics and Reporting
- Student attendance rate calculation
- Class attendance summary by date
- Filter by date range, status, class
- Attendance percentage tracking

## Role-Based Access Control

| Role | Mark Attendance | View Own | View Class | View Stats | Delete |
|------|----------------|----------|------------|------------|--------|
| Student | ❌ | ✅ | ❌ | ✅ (own) | ❌ |
| Teacher | ✅ | ✅ | ✅ | ✅ | ❌ |
| Parent | ❌ | ✅ (child's) | ❌ | ✅ (child's) | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Future Features

### Location-Based Verification
Planned feature for automatic attendance verification:
- Student provides GPS coordinates
- System verifies if student is within school boundaries
- Automatic status based on location and time
- Configurable geofence radius
- Real-time location tracking

**Implementation Ready:**
The service already includes `verifyLocationAttendance()` method that:
- Uses Haversine formula to calculate distance
- Compares student location with school location
- Returns boolean if within acceptable radius

## Usage Example

```typescript
// In another service
constructor(private attendanceService: AttendanceService) {}

// Mark single attendance
async markStudentPresent(classId: string, studentId: string) {
  return await this.attendanceService.markAttendance(classId, {
    student: studentId,
    date: new Date().toISOString(),
    status: 'present'
  });
}

// Get student attendance rate
async getAttendanceRate(studentId: string) {
  const stats = await this.attendanceService.getStudentAttendanceStats(studentId);
  return stats.attendanceRate;
}
```

## Error Handling

The module handles the following errors:
- `400 Bad Request`: Invalid data or failed to mark attendance
- `404 Not Found`: Attendance record not found
- `409 Conflict`: Duplicate attendance record (handled by update)
- `401 Unauthorized`: No authentication token
- `403 Forbidden`: Insufficient permissions

## Testing

Test the endpoints using the attendance.http file:

```http
### Mark attendance
POST http://localhost:3000/attendance/:classId
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "student": "64f5a9b1234567890abcdef1",
  "date": "2024-01-15",
  "status": "present"
}

### Get student attendance
GET http://localhost:3000/attendance/student/:studentId
Authorization: Bearer {{token}}
```

## Database Indexes

- Unique compound index: `(student, class, date)` - Prevents duplicate attendance records
- Improves query performance for common lookups

## Best Practices

1. **Always normalize dates** - Use start of day for consistency
2. **Use bulk operations** - More efficient for class-wide attendance
3. **Track who marked attendance** - Important for audit trail
4. **Include location data** - Useful for verification and analytics
5. **Use appropriate status** - Be specific (late vs absent vs excused)
6. **Add notes when needed** - Document special circumstances

