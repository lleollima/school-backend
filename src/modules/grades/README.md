# Grades Module (Módulo de Notas) 📚

Module for managing student grades and academic performance.

## Features

- ✅ Add grades for students in classes
- ✅ View grades by student
- ✅ View grades by class
- ✅ Update grades
- ✅ Delete grades (admin only)
- 🔮 Future: AI OCR for automatic grade extraction from documents

## Schema

### Grade
```typescript
{
  student: ObjectId (ref: User) - The student receiving the grade
  class: ObjectId (ref: Class) - The class where the grade was assigned
  subject: string - Subject name (e.g., "Mathematics", "Science")
  score: number - Grade score (0-100)
  term: string - Academic term/period (optional)
  createdAt: Date - Creation timestamp
}
```

## API Endpoints

### POST /grades/:classId
Add a new grade for a student in a class.

**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "student": "64f5a9b1234567890abcdef1",
  "subject": "Mathematics",
  "score": 85,
  "term": "Q1 2024"
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
  "subject": "Mathematics",
  "score": 85,
  "term": "Q1 2024",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /grades/student/:studentId
Get all grades for a specific student.

**Authorization:** Student (own grades), Teacher, Admin, Parent

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
    "subject": "Mathematics",
    "score": 85,
    "term": "Q1 2024",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /grades/class/:classId
Get all grades for a specific class.

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
    "class": {
      "_id": "64f5a9b1234567890abcdef3",
      "name": "Mathematics 101",
      "year": 2024
    },
    "subject": "Mathematics",
    "score": 85,
    "term": "Q1 2024"
  }
]
```

### GET /grades/:id
Get a specific grade by ID.

**Authorization:** Student, Teacher, Admin, Parent

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
  "subject": "Mathematics",
  "score": 85,
  "term": "Q1 2024"
}
```

### PATCH /grades/:id
Update a grade.

**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "score": 90,
  "term": "Q2 2024"
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
  "subject": "Mathematics",
  "score": 90,
  "term": "Q2 2024"
}
```

### DELETE /grades/:id
Delete a grade.

**Authorization:** Admin only

**Response:**
```json
{
  "message": "Grade deleted successfully"
}
```

## Validation Rules

### CreateGradeDto
- `student`: Required, must be a valid MongoDB ObjectId
- `subject`: Required, must be a string
- `score`: Required, must be a number between 0 and 100
- `term`: Optional, string

### UpdateGradeDto
- `subject`: Optional, string
- `score`: Optional, number between 0 and 100
- `term`: Optional, string

## Role-Based Access Control

| Role | Add Grade | View Own Grades | View Class Grades | Update Grade | Delete Grade |
|------|-----------|-----------------|-------------------|--------------|--------------|
| Student | ❌ | ✅ | ❌ | ❌ | ❌ |
| Teacher | ✅ | ✅ | ✅ | ✅ | ❌ |
| Parent | ❌ | ✅ (child's) | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Future Features

### AI OCR Upload
Planned endpoint for automatic grade extraction from scanned documents or images:
- Upload image/PDF of grade sheets
- AI processes and extracts grades
- Automatically creates grade records
- Manual review and approval workflow

## Error Handling

The module handles the following errors:
- `400 Bad Request`: Invalid data or failed to create grade
- `404 Not Found`: Grade not found
- `401 Unauthorized`: No authentication token
- `403 Forbidden`: Insufficient permissions

## Usage Example

```typescript
// In another service
constructor(private gradesService: GradesService) {}

async addGradeForStudent(classId: string, studentId: string) {
  return await this.gradesService.addGrade(classId, {
    student: studentId,
    subject: 'Mathematics',
    score: 85,
    term: 'Q1 2024'
  });
}
```

## Testing

Test the endpoints using the grades.http file:

```http
### Add a grade
POST http://localhost:3000/grades/:classId
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "student": "64f5a9b1234567890abcdef1",
  "subject": "Mathematics",
  "score": 85,
  "term": "Q1 2024"
}

### Get student grades
GET http://localhost:3000/grades/student/:studentId
Authorization: Bearer {{token}}
```

