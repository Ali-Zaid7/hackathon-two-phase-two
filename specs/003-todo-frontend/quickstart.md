# Quickstart Guide: Frontend SDD - Todo Full-Stack Web Application

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to backend API (running at configured endpoint)
- Better Auth configured for authentication

## Setup Instructions

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
```

### 2. Install Dependencies
```bash
npm install better-auth @better-auth/react
# Additional dependencies as needed
```

### 3. Configure Tailwind CSS
Follow the official Next.js + Tailwind setup guide, which should be automatically configured by the create-next-app command.

### 4. Create API Client
Create `lib/api.ts` with JWT-aware fetch wrappers:

```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('jwt_token'); // Or however token is stored

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Add specific methods for each endpoint
  getTasks(userId: string) {
    return this.request<TaskResponse[]>(`/api/${userId}/tasks`);
  }

  createTask(userId: string, taskData: TaskCreate) {
    return this.request<TaskResponse>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // ... other methods
}

export const apiClient = new ApiClient();
```

### 5. Start Development Server
```bash
npm run dev
```

## Key Files to Modify
- `app/layout.tsx` - Root layout with auth provider
- `app/page.tsx` - Main dashboard/landing page
- `app/(tasks)/page.tsx` - Task list page
- `app/(tasks)/[id]/page.tsx` - Task detail/edit page
- `components/TaskCard.tsx` - Reusable task display component
- `components/TaskForm.tsx` - Task creation/editing form
- `lib/api.ts` - API client with JWT handling

## Running Tests
```bash
npm run test
# Or specific test commands depending on your setup
```

## Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```