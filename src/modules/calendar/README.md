# Calendar Module (Módulo de Calendário) 📅

Module for managing school events, holidays, exams, meetings, and scheduling.

## Features

- ✅ Create and manage events
- ✅ Multiple event types (meeting, exam, holiday, etc.)
- ✅ Event filtering by date, type, class, user
- ✅ Monthly and yearly views
- ✅ Upcoming events
- ✅ Recurring events support
- ✅ Event participants and classes
- ✅ Priority levels
- ✅ Conflict detection
- ✅ Event statistics
- ✅ Reminders and notifications

## Schema

### Event
```typescript
{
  title: string - Event title
  type: enum - Event type
  description: string (optional) - Event description
  date: Date - Event date
  endDate: Date (optional) - End date for multi-day events
  startTime: string (optional) - Start time (HH:mm format)
  endTime: string (optional) - End time (HH:mm format)
  location: string (optional) - Event location
  priority: enum (optional) - Priority level (low, medium, high)
  createdBy: ObjectId (ref: User) - Event creator
  participants: ObjectId[] (ref: User) - Participants
  classes: ObjectId[] (ref: Class) - Related classes
  allDay: boolean - All-day event flag
  isRecurring: boolean - Recurring event flag
  recurrencePattern: enum (optional) - daily, weekly, monthly, yearly
  recurrenceEndDate: Date (optional) - When recurrence ends
  color: string (optional) - Calendar color (hex code)
  notificationSent: boolean - Notification status
  reminderMinutes: number (optional) - Reminder time before event
}
```

### Event Type Options
- `meeting` - Meetings and assemblies
- `exam` - Exams and tests
- `holiday` - School holidays
- `class` - Class sessions
- `event` - School events
- `deadline` - Deadlines
- `other` - Other events

### Priority Levels
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

### Recurrence Patterns
- `daily` - Repeats every day
- `weekly` - Repeats every week
- `monthly` - Repeats every month
- `yearly` - Repeats every year

## API Endpoints

### GET /calendar
Get all events with optional filters.

**Authorization:** Admin, Teacher, Student, Parent

**Query Parameters:**
- `type` (optional): Filter by type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `classId` (optional): Filter by class
- `userId` (optional): Filter by participant
- `priority` (optional): Filter by priority
- `sortBy` (optional): Sort field
- `sortOrder` (optional): asc or desc

**Response:**
```json
[
  {
    "_id": "64f5a9b1234567890abcdef1",
    "title": "Math Exam",
    "type": "exam",
    "description": "Final exam for Math 101",
    "date": "2024-06-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "11:00",
    "priority": "high",
    "classes": [{
      "_id": "...",
      "name": "Math 101",
      "year": 2024
    }],
    "createdBy": {
      "_id": "...",
      "name": "Prof. Maria"
    }
  }
]
```

### POST /calendar
Create a new event.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "title": "Parent-Teacher Meeting",
  "type": "meeting",
  "description": "Quarterly parent-teacher meeting",
  "date": "2024-06-10",
  "startTime": "14:00",
  "endTime": "17:00",
  "location": "Main Auditorium",
  "priority": "high",
  "participants": ["64f5a9b1234567890abcdef1"],
  "classes": ["64f5a9b1234567890abcdef2"],
  "color": "#FF5733",
  "reminderMinutes": 60
}
```

### GET /calendar/upcoming
Get upcoming events.

**Authorization:** Admin, Teacher, Student, Parent

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 10)

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Math Exam",
    "type": "exam",
    "date": "2024-06-15T00:00:00.000Z"
  }
]
```

### GET /calendar/month/:year/:month
Get events for a specific month.

**Authorization:** Admin, Teacher, Student, Parent

**Example:**
```
GET /calendar/month/2024/6
```

### GET /calendar/type/:type
Get events by type.

**Authorization:** Admin, Teacher, Student, Parent

**Example:**
```
GET /calendar/type/exam
```

### GET /calendar/holidays
Get all holidays.

**Authorization:** Admin, Teacher, Student, Parent

**Query Parameters:**
- `year` (optional): Filter by year

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Christmas",
    "type": "holiday",
    "date": "2024-12-25T00:00:00.000Z",
    "allDay": true
  }
]
```

### GET /calendar/exams
Get all exams.

**Authorization:** Admin, Teacher, Student, Parent

**Query Parameters:**
- `classId` (optional): Filter by class

### GET /calendar/class/:classId
Get events for a specific class.

**Authorization:** Admin, Teacher, Student, Parent

### GET /calendar/user/:userId
Get events for a specific user (as participant).

**Authorization:** Admin, Teacher, Student, Parent

### GET /calendar/stats
Get event statistics.

**Authorization:** Admin, Teacher

**Query Parameters:**
- `startDate` (optional): Start date for stats
- `endDate` (optional): End date for stats

**Response:**
```json
{
  "total": 50,
  "meeting": 10,
  "exam": 15,
  "holiday": 8,
  "class": 12,
  "event": 3,
  "deadline": 2,
  "other": 0
}
```

### GET /calendar/:id
Get a specific event by ID.

**Authorization:** Admin, Teacher, Student, Parent

### PATCH /calendar/:id
Update an event.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "title": "Updated Title",
  "date": "2024-06-20",
  "priority": "high"
}
```

### DELETE /calendar/:id
Delete an event.

**Authorization:** Admin

### POST /calendar/recurring
Generate recurring events.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "event": {
    "title": "Weekly Team Meeting",
    "type": "meeting",
    "date": "2024-01-08",
    "startTime": "10:00",
    "endTime": "11:00",
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "recurrenceEndDate": "2024-12-31"
  },
  "occurrences": 50
}
```

### POST /calendar/check-conflicts
Check for conflicting events.

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "date": "2024-06-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "excludeEventId": "64f5a9b1234567890abcdef1"
}
```

## Validation Rules

### CreateEventDto
- `title`: Required, string
- `type`: Required, enum (meeting, exam, holiday, class, event, deadline, other)
- `description`: Optional, string
- `date`: Required, ISO date string
- `endDate`: Optional, ISO date string (must be >= date)
- `startTime`: Optional, string (HH:mm format)
- `endTime`: Optional, string (HH:mm format)
- `location`: Optional, string
- `priority`: Optional, enum (low, medium, high)
- `participants`: Optional, array of MongoDB ObjectIds
- `classes`: Optional, array of MongoDB ObjectIds
- `allDay`: Optional, boolean
- `isRecurring`: Optional, boolean
- `recurrencePattern`: Optional, enum (daily, weekly, monthly, yearly)
- `recurrenceEndDate`: Optional, ISO date string
- `color`: Optional, hex color code (e.g., #FF5733)
- `reminderMinutes`: Optional, integer >= 0

### UpdateEventDto
All fields optional, same validation as CreateEventDto

## Features

### Recurring Events
Create events that repeat on a schedule:
```typescript
{
  "isRecurring": true,
  "recurrencePattern": "weekly",
  "recurrenceEndDate": "2024-12-31"
}
```

### Multi-Day Events
Events that span multiple days:
```typescript
{
  "date": "2024-06-10",
  "endDate": "2024-06-12",
  "allDay": true
}
```

### Event Participants
Add users to events:
```typescript
{
  "participants": ["userId1", "userId2", "userId3"]
}
```

### Class Events
Link events to specific classes:
```typescript
{
  "classes": ["classId1", "classId2"]
}
```

### Priority Levels
Set event importance:
```typescript
{
  "priority": "high" // low, medium, high
}
```

### Custom Colors
Customize calendar appearance:
```typescript
{
  "color": "#FF5733" // Hex color code
}
```

### Reminders
Set reminder time before event:
```typescript
{
  "reminderMinutes": 60 // 1 hour before
}
```

## Role-Based Access Control

| Role | View Events | Create Event | Update Event | Delete Event |
|------|-------------|--------------|--------------|--------------|
| Student | ✅ | ❌ | ❌ | ❌ |
| Teacher | ✅ | ✅ | ✅ | ❌ |
| Parent | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

## Usage Examples

```typescript
// In another service
constructor(private calendarService: CalendarService) {}

// Create an exam
async scheduleExam(classId: string) {
  return await this.calendarService.createEvent({
    title: 'Final Exam - Mathematics',
    type: 'exam',
    date: '2024-06-15',
    startTime: '09:00',
    endTime: '11:00',
    classes: [classId],
    priority: 'high'
  });
}

// Get upcoming events
async getUpcoming() {
  return await this.calendarService.getUpcomingEvents(5);
}

// Check conflicts
async checkScheduleConflict(date: Date, start: string, end: string) {
  return await this.calendarService.checkConflicts(date, start, end);
}
```

## Error Handling

The module handles the following errors:
- `400 Bad Request`: Invalid data or validation errors
- `404 Not Found`: Event not found
- `401 Unauthorized`: No authentication token
- `403 Forbidden`: Insufficient permissions

## Database Indexes

- Index: `date` - For date-based queries
- Index: `type` - For filtering by type
- Composite index: `(date, type)` - For combined queries

## Best Practices

1. **Use appropriate event types** - Choose the correct type for better organization
2. **Set priorities** - Mark important events with high priority
3. **Add participants** - Include relevant users in events
4. **Link to classes** - Associate events with classes when applicable
5. **Use recurring events** - For regular scheduled events
6. **Set reminders** - Configure notification times
7. **Check conflicts** - Before creating events at the same time
8. **Use colors** - Visual distinction for different event types

## Testing

Test the endpoints using the calendar.http file:

```http
### Create event
POST http://localhost:3000/calendar
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Math Exam",
  "type": "exam",
  "date": "2024-06-15",
  "startTime": "09:00",
  "endTime": "11:00"
}
```

