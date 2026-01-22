# Data Model: Frontend SDD - Todo Full-Stack Web Application

## Task Entity
**Description**: Represents a user's to-do item with properties for tracking and management.

**Fields**:
- `id`: UUID (primary identifier, immutable)
- `user_id`: string (owner identifier from JWT token)
- `title`: string (required, 1-255 characters)
- `description`: string | null (optional, can be null)
- `is_completed`: boolean (completion status, default: false)
- `priority`: number (priority level, 1-5 scale, default: 1)
- `created_at`: datetime (timestamp when task was created)
- `updated_at`: datetime (timestamp when task was last updated)

**Validation Rules**:
- Title must be 1-255 characters
- Priority must be between 1-5 inclusive
- Description length should not exceed 1000 characters (if provided)

**State Transitions**:
- `is_completed`: false → true (when task is marked complete)
- `is_completed`: true → false (when task is marked incomplete)

## User Session Entity
**Description**: Represents authenticated user state with JWT token and user identification.

**Fields**:
- `user_id`: string (unique identifier from JWT token)
- `username`: string (display name for the user)
- `email`: string (user's email address)
- `isLoggedIn`: boolean (authentication status)
- `token`: string (JWT token for API authentication)

**State Transitions**:
- `isLoggedIn`: false → true (when user authenticates)
- `isLoggedIn`: true → false (when user logs out or token expires)

## API Response Format
**TaskResponse**:
```typescript
interface TaskResponse {
  id: string;          // UUID
  user_id: string;     // Owner identifier
  title: string;       // Task title (1-255 chars)
  description: string | null;  // Optional description
  is_completed: boolean;       // Completion status
  priority: number;    // Priority level (1-5)
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
}
```

**TaskCreate**:
```typescript
interface TaskCreate {
  title: string;       // Required (1-255 chars)
  description?: string | null;  // Optional
  priority?: number;   // Optional (default: 1)
  is_completed?: boolean;       // Optional (default: false)
}
```

**TaskUpdate**:
```typescript
interface TaskUpdate {
  title?: string;      // Optional update
  description?: string | null;  // Optional update
  priority?: number;   // Optional update
  is_completed?: boolean;       // Optional update
}
```

## Component Props Types
**TaskCard Props**:
```typescript
interface TaskCardProps {
  task: TaskResponse;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}
```

**TaskForm Props**:
```typescript
interface TaskFormProps {
  task?: TaskResponse;  // Optional for edit mode
  onSubmit: (formData: TaskCreate | TaskUpdate) => void;
  onCancel?: () => void;
  submitLabel: string;
}
```