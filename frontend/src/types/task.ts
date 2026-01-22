// frontend/src/types/task.ts

export interface TaskResponse {
  id: string;          // UUID
  user_id: string;     // Owner identifier
  title: string;       // Task title (1-255 chars)
  description: string | null;  // Optional description
  is_completed: boolean;       // Completion status
  priority: number;    // Priority level (1-5)
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
}

export interface TaskCreate {
  title: string;       // Required (1-255 chars)
  description?: string | null;  // Optional
  priority?: number;   // Optional (default: 1)
  is_completed?: boolean;       // Optional (default: false)
}

export interface TaskUpdate {
  title?: string;      // Optional update
  description?: string | null;  // Optional update
  priority?: number;   // Optional update
  is_completed?: boolean;       // Optional update
}