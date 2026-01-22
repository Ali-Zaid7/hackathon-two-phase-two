# API Contract: Task Management Endpoints

## Overview
This document defines the contract between the frontend application and the backend API for task management functionality. All endpoints require JWT authentication in the Authorization header.

## Common Headers
- `Authorization: Bearer {jwt_token}` - Required for all endpoints
- `Content-Type: application/json` - Required for POST/PUT/PATCH requests

## Endpoints

### GET /api/{user_id}/tasks
**Description**: Retrieve all tasks for the specified user

**Path Parameters**:
- `user_id` (string, required): The ID of the user whose tasks to retrieve

**Response**:
- `200 OK`: Array of TaskResponse objects
```json
[
  {
    "id": "uuid-string",
    "user_id": "user-id-string",
    "title": "Task title",
    "description": "Task description or null",
    "is_completed": false,
    "priority": 1,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to access these tasks

### POST /api/{user_id}/tasks
**Description**: Create a new task for the specified user

**Path Parameters**:
- `user_id` (string, required): The ID of the user creating the task

**Request Body**:
```json
{
  "title": "Task title (required, 1-255 chars)",
  "description": "Task description (optional)",
  "priority": 1,
  "is_completed": false
}
```

**Response**:
- `201 Created`: New TaskResponse object
```json
{
  "id": "new-uuid-string",
  "user_id": "user-id-string",
  "title": "Task title",
  "description": "Task description or null",
  "is_completed": false,
  "priority": 1,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to create tasks for this user_id
- `422 Unprocessable Entity`: Validation errors

### GET /api/{user_id}/tasks/{id}
**Description**: Retrieve a specific task

**Path Parameters**:
- `user_id` (string, required): The ID of the user who owns the task
- `id` (string, required): The UUID of the task to retrieve

**Response**:
- `200 OK`: Single TaskResponse object
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
  "title": "Task title",
  "description": "Task description or null",
  "is_completed": false,
  "priority": 1,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to access this task
- `404 Not Found`: Task does not exist

### PUT /api/{user_id}/tasks/{id}
**Description**: Update an existing task

**Path Parameters**:
- `user_id` (string, required): The ID of the user who owns the task
- `id` (string, required): The UUID of the task to update

**Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": 2,
  "is_completed": true
}
```

**Response**:
- `200 OK`: Updated TaskResponse object
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
  "title": "Updated task title",
  "description": "Updated task description",
  "is_completed": true,
  "priority": 2,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to update this task
- `404 Not Found`: Task does not exist
- `422 Unprocessable Entity`: Validation errors

### DELETE /api/{user_id}/tasks/{id}
**Description**: Delete a specific task

**Path Parameters**:
- `user_id` (string, required): The ID of the user who owns the task
- `id` (string, required): The UUID of the task to delete

**Response**:
- `204 No Content`: Task successfully deleted

**Errors**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to delete this task
- `404 Not Found`: Task does not exist

### PATCH /api/{user_id}/tasks/{id}/complete
**Description**: Toggle the completion status of a task

**Path Parameters**:
- `user_id` (string, required): The ID of the user who owns the task
- `id` (string, required): The UUID of the task to update

**Response**:
- `200 OK`: Updated TaskResponse object with toggled completion status
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
  "title": "Task title",
  "description": "Task description or null",
  "is_completed": true,  // Status has been toggled
  "priority": 1,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have permission to update this task
- `404 Not Found`: Task does not exist