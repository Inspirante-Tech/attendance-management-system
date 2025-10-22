# Testing the New Marks API

## Prerequisites

- Server running on http://localhost:5000 (or your configured port)
- Admin authentication token
- At least one course offering exists in the database

## 1. Create Test Components for a Course Offering

First, get a course offering ID from your database, then create test components:

```bash
# POST /admin/offerings/{offeringId}/components
curl -X POST http://localhost:5000/admin/offerings/{offeringId}/components \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "components": [
      {
        "name": "MSE1",
        "maxMarks": 50,
        "weightage": 100,
        "type": "theory"
      },
      {
        "name": "MSE2",
        "maxMarks": 50,
        "weightage": 100,
        "type": "theory"
      },
      {
        "name": "Assignment 1",
        "maxMarks": 20,
        "weightage": 100,
        "type": "theory"
      },
      {
        "name": "Lab Record",
        "maxMarks": 30,
        "weightage": 100,
        "type": "lab"
      }
    ]
  }'
```

Expected Response:

```json
{
  "status": "success",
  "message": "Test components created successfully",
  "components": [
    {
      "id": "uuid-1",
      "courseOfferingId": "offering-uuid",
      "name": "MSE1",
      "maxMarks": 50,
      "weightage": 100,
      "type": "theory"
    },
    ...
  ]
}
```

## 2. View Test Components

```bash
# GET /admin/offerings/{offeringId}/components
curl http://localhost:5000/admin/offerings/{offeringId}/components \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 3. Update Student Marks

Use an enrollment ID and the test component IDs from step 1:

```bash
# PUT /admin/marks/{enrollmentId}
curl -X PUT http://localhost:5000/admin/marks/{enrollmentId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "marks": [
      {
        "testComponentId": "uuid-1",
        "marksObtained": 45
      },
      {
        "testComponentId": "uuid-2",
        "marksObtained": 42
      },
      {
        "testComponentId": "uuid-3",
        "marksObtained": 18
      },
      {
        "testComponentId": "uuid-4",
        "marksObtained": 25
      }
    ]
  }'
```

Expected Response:

```json
{
  "status": "success",
  "message": "Marks updated successfully"
}
```

## 4. Get Marks for Specific Enrollment

```bash
# GET /admin/marks/{enrollmentId}
curl http://localhost:5000/admin/marks/{enrollmentId} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected Response:

```json
{
  "status": "success",
  "data": {
    "id": "enrollment-uuid",
    "enrollmentId": "enrollment-uuid",
    "student": {
      "id": "student-uuid",
      "usn": "4NM21CS001",
      "user": {
        "name": "John Doe"
      }
    },
    "course": {
      "id": "course-uuid",
      "code": "CS101",
      "name": "Data Structures",
      "hasTheoryComponent": true,
      "hasLabComponent": true
    },
    "testComponents": [...],
    "theoryMarks": [
      {
        "id": "mark-uuid-1",
        "testComponentId": "uuid-1",
        "testName": "MSE1",
        "maxMarks": 50,
        "marksObtained": 45,
        "weightage": 100
      },
      {
        "id": "mark-uuid-2",
        "testComponentId": "uuid-2",
        "testName": "MSE2",
        "maxMarks": 50,
        "marksObtained": 42,
        "weightage": 100
      },
      {
        "id": "mark-uuid-3",
        "testComponentId": "uuid-3",
        "testName": "Assignment 1",
        "maxMarks": 20,
        "marksObtained": 18,
        "weightage": 100
      }
    ],
    "labMarks": [
      {
        "id": "mark-uuid-4",
        "testComponentId": "uuid-4",
        "testName": "Lab Record",
        "maxMarks": 30,
        "marksObtained": 25,
        "weightage": 100
      }
    ],
    "theoryTotal": 105,
    "labTotal": 25,
    "grandTotal": 130
  }
}
```

## 5. Get All Marks with Filtering

```bash
# Get marks for a specific course
curl "http://localhost:5000/admin/marks?courseId={courseId}" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get marks for a specific student by USN
curl "http://localhost:5000/admin/marks?studentUsn=4NM21CS001" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get marks for a department and year
curl "http://localhost:5000/admin/marks?departmentId={deptId}&year=2021" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 6. Teacher Gets Marks

```bash
# GET /teacher/marks
curl "http://localhost:5000/teacher/marks?courseId={courseId}" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"

# Filter by specific student
curl "http://localhost:5000/teacher/marks?courseId={courseId}&studentUsn=4NM21CS001" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

## 7. Student Views Their Marks

```bash
# GET /student/{userId}/marks
curl http://localhost:5000/student/{userId}/marks \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Expected Response:

```json
{
  "student": {
    "name": "John Doe",
    "usn": "4NM21CS001",
    "semester": 5,
    "batchYear": 2021
  },
  "marksData": [
    {
      "courseCode": "CS101",
      "courseName": "Data Structures",
      "theoryMarks": [
        {
          "testName": "MSE1",
          "marksObtained": 45,
          "maxMarks": 50,
          "weightage": 100
        },
        {
          "testName": "MSE2",
          "marksObtained": 42,
          "maxMarks": 50,
          "weightage": 100
        },
        {
          "testName": "Assignment 1",
          "marksObtained": 18,
          "maxMarks": 20,
          "weightage": 100
        }
      ],
      "labMarks": [
        {
          "testName": "Lab Record",
          "marksObtained": 25,
          "maxMarks": 30,
          "weightage": 100
        }
      ],
      "theoryTotal": 105,
      "labTotal": 25,
      "totalMarks": 130,
      "maxTotalMarks": 150,
      "percentage": 86.67,
      "grade": "A+"
    }
  ]
}
```

## 8. Update a Test Component

```bash
# PUT /admin/components/{componentId}
curl -X PUT http://localhost:5000/admin/components/{componentId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "MSE1 Updated",
    "maxMarks": 60
  }'
```

## 9. Delete a Test Component

```bash
# DELETE /admin/components/{componentId}
curl -X DELETE http://localhost:5000/admin/components/{componentId} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected Response:

```json
{
  "status": "success",
  "message": "Test component deleted successfully"
}
```

## Validation Tests

### Test 1: Marks exceed maximum

```bash
curl -X PUT http://localhost:5000/admin/marks/{enrollmentId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "marks": [
      {
        "testComponentId": "uuid-1",
        "marksObtained": 60
      }
    ]
  }'
```

Expected Error:

```json
{
  "status": "error",
  "error": "Marks obtained (60) exceed max marks (50) for MSE1"
}
```

### Test 2: Invalid test component

```bash
curl -X PUT http://localhost:5000/admin/marks/{enrollmentId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "marks": [
      {
        "testComponentId": "invalid-uuid",
        "marksObtained": 45
      }
    ]
  }'
```

Expected Error:

```json
{
  "status": "error",
  "error": "Invalid test component IDs",
  "invalidComponents": ["invalid-uuid"]
}
```

## Notes

- Replace `{offeringId}`, `{enrollmentId}`, `{componentId}`, etc. with actual UUIDs from your database
- Replace `YOUR_ADMIN_TOKEN`, `YOUR_TEACHER_TOKEN`, `YOUR_STUDENT_TOKEN` with valid JWT tokens
- All endpoints return consistent JSON responses with `status` field
- Error responses include descriptive `error` messages
- The system automatically handles theory/lab categorization
- Marks are validated against max marks and test component ownership
