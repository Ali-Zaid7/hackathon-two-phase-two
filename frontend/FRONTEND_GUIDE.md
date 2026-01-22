# Frontend Architecture Guide

A comprehensive developer reference for navigating and debugging the Todo App frontend.

---

## 📁 Folder Structure Map

```
frontend/
├── public/                          # Static assets (images, icons, etc.)
├── src/                             # Source code root
│   ├── app/                         # Next.js App Router pages & layouts
│   │   ├── api/                     # API route handlers
│   │   │   └── auth/               # Authentication endpoints
│   │   ├── login/                  # Login page component
│   │   ├── tasks/                  # Task management pages
│   │   │   └── [id]/               # Dynamic task detail page
│   │   ├── favicon.ico             # App favicon
│   │   ├── globals.css             # Global styles (Tailwind imports)
│   │   ├── layout.tsx              # Root layout with AuthProvider wrapper
│   │   └── page.tsx                # Home page (dashboard)
│   ├── components/                  # Reusable React components
│   │   ├── AuthProvider.tsx        # Authentication context provider
│   │   ├── ErrorBoundary.tsx       # Error boundary for crash handling
│   │   ├── Header.tsx              # Navigation header component
│   │   ├── LoadingSpinner.tsx      # Loading indicator component
│   │   ├── TaskCard.tsx            # Individual task display component
│   │   ├── TaskForm.tsx            # Task creation/editing form
│   │   └── Toast.tsx               # Toast notification component
│   ├── hooks/                       # Custom React hooks
│   │   └── useApiStatus.ts         # Hook for tracking API request states
│   ├── lib/                         # Utility functions & client logic
│   │   ├── api.ts                  # Axios/Fetch API client & request helpers
│   │   ├── auth.ts                 # Auth utility functions
│   │   ├── auth-client.ts          # Client-side auth context & methods
│   │   └── auth-server.ts          # Server-side auth utilities
│   └── types/                       # TypeScript interfaces & types
│       └── task.ts                 # Task-related type definitions
├── .env.local                       # Local environment variables
├── eslint.config.mjs               # ESLint configuration
├── next-env.d.ts                   # Next.js environment type definitions
├── next.config.ts                  # Next.js configuration
├── package.json                    # NPM dependencies & scripts
├── postcss.config.mjs              # PostCSS configuration (Tailwind)
├── tsconfig.json                   # TypeScript compiler configuration
└── README.md                        # Quick start guide
```

---

## 📖 Detailed Folder & File Guide

### 📁 Root Level Configuration Files

#### `package.json`
- **Purpose**: Declares project metadata, dependencies, and npm scripts
- **Key Scripts**:
  - `npm run dev` - Start development server (Next.js on http://localhost:3000)
  - `npm run build` - Production build
  - `npm run start` - Run production server
  - `npm run lint` - Run ESLint for code quality
- **Key Dependencies**:
  - `next@16.1.3` - React framework
  - `react@19.2.3` & `react-dom@19.2.3` - UI library
  - `better-auth@1.4.14` - Authentication system
  - `@tailwindcss/postcss@4` - Styling framework
- **Debugging**: Check here when npm commands fail or dependencies are missing

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - `"target": "ES2017"` - Supports modern JavaScript features
  - `"strict": true` - Enables strict type checking
  - `"paths"`: Maps `@/*` to `./src/*` for clean imports
- **Debugging**: Use this to understand TypeScript errors or module resolution issues

#### `next.config.ts`
- **Purpose**: Next.js framework configuration
- **Common Adjustments**: API proxy settings, build optimization, environment variables
- **Debugging**: Check here if Next.js features aren't working as expected

#### `eslint.config.mjs` & `postcss.config.mjs`
- **Purpose**: Code linting rules and CSS post-processing configuration
- **Debugging**: If styling looks broken or linting fails unexpectedly, check these files

#### `.env.local`
- **Purpose**: Local environment variables (git-ignored)
- **Critical**: Set `NEXT_PUBLIC_API_URL` to point to your backend API
- **Debugging**: If API calls fail, verify this file has correct backend URL

---

### 📁 `/public` Directory

- **Purpose**: Serves static files directly (no processing)
- **Content**: Favicons, images, logos, downloadable assets
- **Usage**: Reference in code as `/filename.ext` (e.g., `<img src="/logo.png" />`)
- **Debugging**: Check file paths if images/icons don't load; ensure files exist here

---

### 📁 `/src` - Source Code Root

All application source code lives here. The `@/` import alias in TypeScript resolves to this directory.

---

#### 📁 `/src/app` - Next.js Pages & Routes

The App Router structure determines URL routes automatically. Each folder represents a route segment.

##### **Root Files**
- **`layout.tsx`**: Root layout wrapper for all pages
  - Sets metadata (title, description)
  - Wraps app with `AuthProvider` context
  - Imports global styles from `globals.css`
  - **Debug**: If auth context isn't available, check this file

- **`page.tsx`**: Home page (rendered at `/`)
  - Usually displays dashboard or welcome
  - **Debug**: Check if home route isn't loading

- **`globals.css`**: Global Tailwind CSS imports and base styles
  - All pages inherit these styles
  - **Debug**: Check here for styling issues that affect the whole app

- **`favicon.ico`**: Browser tab icon
  - **Debug**: If favicon doesn't show, ensure file is here

##### **`/src/app/api` - API Routes**

Route handlers for backend API calls (Next.js handles proxying).

- **`/auth`** - Authentication endpoints
  - Handles login, register, logout
  - **Debug**: If auth fails, check request/response format matches backend

##### **`/src/app/login`**

- **`page.tsx`**: Login page component
  - **Route**: Rendered at `/login`
  - **Purpose**: User authentication interface
  - **Debug**: Check form submission and error messages here

##### **`/src/app/tasks`**

- **`page.tsx`**: Task list/dashboard page
  - **Route**: Rendered at `/tasks`
  - **Purpose**: Displays all user tasks
  - **Debug**: Check if tasks don't load (verify API connection)

- **`[id]/`** - Dynamic route for individual tasks
  - **Route**: `/tasks/[id]` where `[id]` is the task UUID
  - **Purpose**: Edit/view specific task
  - **Debug**: Verify UUID parameter is passed correctly in URLs

---

#### 📁 `/src/components` - Reusable UI Components

Each component is a standalone, reusable piece of UI.

##### **`AuthProvider.tsx`**
- **Purpose**: React Context provider for authentication state
- **Provides**:
  - `user` - Current logged-in user object
  - `token` - Auth JWT token
  - `isLoggedIn` - Boolean flag
  - `login(email, password)` - Async login function
  - `register(email, password, name)` - Async registration function
  - `logout()` - Async logout function
  - `refreshSession()` - Refresh auth token
- **Usage**: Wrap components that need auth with `useAuth()` hook
- **Debug**: Check context values if auth state doesn't update; verify `authClient` config

##### **`Header.tsx`**
- **Purpose**: Navigation header/navbar component
- **Content**: Logo, nav links, user menu
- **Debug**: Check if navigation links are broken or styling is off

##### **`TaskCard.tsx`**
- **Purpose**: Displays individual task in a card format
- **Props**:
  - `task` - TaskResponse object
  - `onToggleComplete` - Callback when marking complete
  - `onEdit` - Callback when editing
  - `onDelete` - Callback when deleting
- **Features**: Shows title, description, priority, completion status
- **Debug**: Check if task data isn't displaying; verify props passed correctly

##### **`TaskForm.tsx`**
- **Purpose**: Form component for creating/editing tasks
- **Fields**: Title, description, priority, completion status
- **Debug**: Verify form submission and validation logic

##### **`LoadingSpinner.tsx`**
- **Purpose**: Loading indicator while data fetches
- **Debug**: Check if spinner doesn't show during API calls

##### **`ErrorBoundary.tsx`**
- **Purpose**: Catches React component errors to prevent app crash
- **Behavior**: Shows fallback UI when child component errors
- **Debug**: Check here if app crashes silently; examine error logs

##### **`Toast.tsx`**
- **Purpose**: Toast notification component for user feedback
- **Usage**: Show success, error, warning messages
- **Debug**: Verify toast messages display correctly on API operations

---

#### 📁 `/src/hooks` - Custom React Hooks

Encapsulate reusable stateful logic.

##### **`useApiStatus.ts`**
- **Purpose**: Tracks API request status (loading, error, success)
- **Returns**: `{ loading, error, data, execute }`
- **Usage**: `const { loading, error, data } = useApiStatus()`
- **Debug**: Use this to track API request states in components; helps identify slow/failed requests

---

#### 📁 `/src/lib` - Utility Functions & Client Logic

Contains helper functions, API clients, and configuration.

##### **`api.ts`**
- **Purpose**: HTTP client for all backend API calls
- **Key Functions**:
  - `getTasks()` - Fetch all tasks
  - `getTask(id)` - Fetch single task
  - `createTask(data)` - Create new task
  - `updateTask(id, data)` - Update existing task
  - `deleteTask(id)` - Delete task
- **Base URL**: Uses `NEXT_PUBLIC_API_URL` from `.env.local`
- **Debug**: If API calls fail, check:
  1. `.env.local` has correct `NEXT_PUBLIC_API_URL`
  2. Backend server is running
  3. Response format matches `TaskResponse` interface

##### **`auth.ts`**
- **Purpose**: General authentication utilities
- **Functions**: Token validation, session checking, etc.
- **Debug**: Check for token expiration or refresh issues

##### **`auth-client.ts`**
- **Purpose**: Client-side authentication using `better-auth` library
- **Provides**: Methods for login, register, logout, session management
- **Debug**: Verify client configuration matches backend auth service

##### **`auth-server.ts`**
- **Purpose**: Server-side auth utilities (for API routes)
- **Debug**: Check if server-side auth middleware isn't working

---

#### 📁 `/src/types` - TypeScript Type Definitions

Centralized interfaces for type safety.

##### **`task.ts`**
- **Interfaces**:
  - `TaskResponse` - API response format for a task
  - `TaskCreate` - Request body for creating tasks
  - `TaskUpdate` - Request body for updating tasks
- **Debug**: If TypeScript errors occur, verify API responses match these interfaces; if backend schema changes, update these types

---

## 🛠️ Common Debugging Workflows

### Issue: Components Don't Load
1. Check `src/app/layout.tsx` - Is `AuthProvider` wrapping children?
2. Verify TypeScript compilation: `npm run lint`
3. Check browser console for errors

### Issue: API Calls Fail
1. Verify `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000` (or your backend URL)
2. Check `src/lib/api.ts` - Are requests formatted correctly?
3. Ensure backend is running and accessible
4. Check browser Network tab for response status/errors

### Issue: Auth Not Working
1. Check `src/components/AuthProvider.tsx` - Is context properly initialized?
2. Verify `src/lib/auth-client.ts` configuration
3. Check backend auth service is running
4. Verify login/register endpoints match backend

### Issue: Styling Issues (Tailwind)
1. Check `src/app/globals.css` - Are Tailwind imports present?
2. Verify `postcss.config.mjs` configuration
3. Run `npm run build` to ensure CSS is compiled
4. Check component className attributes use Tailwind classes

### Issue: TypeScript Errors
1. Check `tsconfig.json` for compiler settings
2. Verify types in `src/types/task.ts` match API responses
3. Run `npm run lint` for detailed error messages
4. Check `@/*` path alias is resolving correctly

---

## 🚀 Development Tips

1. **Use the `@/` import alias** for clean imports: `import { getTasks } from '@/lib/api'`
2. **Check AuthProvider context** in all auth-dependent components
3. **Add error boundaries** around feature sections to catch crashes
4. **Use `useApiStatus` hook** for loading/error states
5. **Keep components small** - split large components into smaller ones in `/components`
6. **Test API endpoints** with the backend before integrating in components
7. **Use TypeScript strict mode** to catch bugs early

---

## 📚 Quick Reference

| File/Folder | Purpose |
|---|---|
| `src/app/` | Pages and routes |
| `src/components/` | Reusable UI building blocks |
| `src/hooks/` | Custom React logic |
| `src/lib/api.ts` | Backend API client |
| `src/lib/auth-client.ts` | Authentication logic |
| `src/types/task.ts` | Task TypeScript interfaces |
| `.env.local` | Backend API URL configuration |
| `globals.css` | App-wide styles |
| `AuthProvider.tsx` | User session management |

---

## 🔗 Related Documentation

- **Backend**: See `backend/README.md` for API documentation
- **Database**: See `database/schema.md` for data model
- **Integration Testing**: See `specs/001-integration-testing/` for test contracts
