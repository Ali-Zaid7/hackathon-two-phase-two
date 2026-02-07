# Implementation Tasks: Frontend SDD - Todo Full-Stack Web Application

**Feature**: Frontend SDD - Todo Full-Stack Web Application
**Branch**: 003-todo-frontend
**Spec**: [specs/003-todo-frontend/spec.md](./spec.md)
**Plan**: [specs/003-todo-frontend/plan.md](./plan.md)
**Last Updated**: 2026-02-06 (Aligned with refined spec and Constitution v3.1.1)

## Task List

### Phase 1: Project Setup and Authentication

**Task 1.1: Initialize Next.js Project**
- **Objective**: Set up the basic Next.js 16+ project with TypeScript and Tailwind CSS
- **Steps**:
  1. Create new Next.js app with `create-next-app`
  2. Configure TypeScript and Tailwind CSS
  3. Set up basic project structure following App Router conventions
- **Files**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- **Acceptance Criteria**:
  - Project initializes without errors
  - TypeScript compiles successfully
  - Tailwind CSS classes are applied correctly
- **Dependencies**: None
- **Reference**: quickstart.md, plan.md

**Task 1.2: Integrate Better Auth**
- **Objective**: Set up Better Auth for user authentication
- **Steps**:
  1. Install Better Auth dependencies
  2. Configure auth provider at root layout
  3. Set up session handling
  4. Create `app/api/auth/[...all]/route.ts` handler (matches actual implementation)
- **Files**: `frontend/app/layout.tsx`, `frontend/lib/auth-server.ts`, `frontend/lib/auth-client.ts`, `frontend/app/api/auth/[...all]/route.ts`
- **Acceptance Criteria**:
  - User can authenticate via Better Auth
  - Session information is accessible throughout the app
  - JWT token is available for API requests
- **Dependencies**: Task 1.1
- **Reference**: spec.md (FR-001), plan.md
- **Note**: Updated route pattern to match actual implementation (`[...all]` instead of `[[...better-auth]]`)

**Task 1.3: Create API Client Library**
- **Objective**: Implement centralized API client with JWT handling
- **Steps**:
  1. Create `/lib/api.ts` with API client class
  2. Implement JWT token attachment to all requests
  3. Create wrapper functions for all backend endpoints
- **Files**: `frontend/lib/api.ts`
- **Acceptance Criteria**:
  - All API calls include Authorization header with JWT token
  - Error handling is implemented for API responses
  - All required endpoints are wrapped (GET/POST/PUT/DELETE/PATCH for tasks)
- **Dependencies**: Task 1.2
- **Reference**: spec.md (FR-002), plan.md, contracts/task-api-contract.md

### Phase 2: Core UI Components

**Task 2.1: Create TaskCard Component**
- **Objective**: Build reusable component to display individual tasks
- **Steps**:
  1. Create `components/TaskCard.tsx`
  2. Display task properties (title, description, status, priority, dates)
  3. Add buttons for edit, delete, and toggle completion
  4. Style with Tailwind CSS for responsive design
  5. Implement completed task visual style (strikethrough + faded appearance per FR-014)
- **Files**: `frontend/components/TaskCard.tsx`
- **Acceptance Criteria**:
  - Task information is displayed clearly
  - Interactive elements work properly
  - Component is responsive on mobile and desktop
  - Visual indication of completion status (strikethrough + faded per FR-014)
- **Dependencies**: Task 1.3
- **Reference**: spec.md (FR-014, Task Card requirements), data-model.md

**Task 2.2: Create TaskForm Component**
- **Objective**: Build form component for creating and updating tasks
- **Steps**:
  1. Create `components/TaskForm.tsx`
  2. Include fields for title, description, priority
  3. Implement form validation (title required, max lengths)
  4. Add submit and cancel functionality
  5. Style with Tailwind CSS
  6. Support both create and edit modes (conditionally rendered)
- **Files**: `frontend/components/TaskForm.tsx`
- **Acceptance Criteria**:
  - Form validates required fields (title)
  - Form handles both create and update modes
  - Proper error handling for validation (inline per FR-012)
  - Responsive design works on all screen sizes
- **Dependencies**: Task 1.3
- **Reference**: spec.md (FR-003, FR-013: inline forms), data-model.md

**Task 2.3: Create Header and Navigation Components**
- **Objective**: Build consistent header and navigation across the app
- **Steps**:
  1. Create `components/Header.tsx`
  2. Display user information (username/email)
  3. Add logout functionality
  4. Create navigation links
  5. Style with Tailwind CSS
- **Files**: `frontend/components/Header.tsx`
- **Acceptance Criteria**:
  - User information is displayed correctly
  - Logout functionality works
  - Navigation is intuitive and consistent
  - Responsive design works on all screen sizes
- **Dependencies**: Task 1.2
- **Reference**: spec.md (Header/Nav requirements), plan.md

### Phase 3: Task Management Pages

**Task 3.1: Create Task List Page with Inline Task Creation**
- **Objective**: Implement page to display all tasks with inline task creation form
- **Steps**:
  1. Create `app/tasks/page.tsx` (not `app/(tasks)/page.tsx`)
  2. Fetch tasks from API using JWT token
  3. Display tasks using TaskCard components
  4. Add loading and error states
  5. Implement "Add Task" button that shows inline TaskForm (per FR-013)
  6. Use state management (e.g., `showCreateForm` state) to conditionally render TaskForm
- **Files**: `frontend/app/tasks/page.tsx`, `frontend/app/tasks/layout.tsx`
- **Acceptance Criteria**:
  - All user's tasks are displayed
  - Loading states are shown during API calls
  - Error states are handled gracefully (inline per FR-012)
  - "Add Task" button toggles inline TaskForm visibility
  - Inline form submission creates task without page navigation
  - Page is responsive on mobile and desktop
- **Dependencies**: Tasks 1.3, 2.1, 2.2
- **Reference**: spec.md (User Story 1, FR-004, FR-013: inline forms), contracts/task-api-contract.md
- **Note**: Updated to reflect inline form pattern (no separate `/tasks/new` page)

**Task 3.2: Create Task Detail/Edit Page**
- **Objective**: Implement page for viewing and editing individual tasks
- **Steps**:
  1. Create `app/tasks/[id]/page.tsx`
  2. Fetch specific task from API using JWT token
  3. Display task details using TaskCard or dedicated view
  4. Include inline TaskForm for editing
  5. Add loading and error states
- **Files**: `frontend/app/tasks/[id]/page.tsx`
- **Acceptance Criteria**:
  - Specific task is displayed correctly
  - Editing functionality works end-to-end
  - Loading states are shown during API calls
  - Error states are handled gracefully
  - Page is responsive on mobile and desktop
- **Dependencies**: Tasks 1.3, 2.1, 2.2
- **Reference**: spec.md (User Story 2, FR-005), contracts/task-api-contract.md

### Phase 4: Task Operations and Enhancements

**Task 4.1: Implement Task Update Operations**
- **Objective**: Enable users to update existing tasks
- **Steps**:
  1. Connect TaskForm in edit mode to API client for PUT requests
  2. Handle success and error cases for updates
  3. Update UI after successful update
- **Files**: `frontend/components/TaskForm.tsx`, `frontend/app/tasks/[id]/page.tsx`
- **Acceptance Criteria**:
  - Users can update tasks successfully
  - Updated tasks reflect changes in the UI
  - Error handling provides user feedback (inline per FR-012)
  - Success creates appropriate user feedback
- **Dependencies**: Tasks 1.3, 2.2, 3.2
- **Reference**: spec.md (FR-005), contracts/task-api-contract.md

**Task 4.2: Implement Task Deletion**
- **Objective**: Enable users to delete tasks
- **Steps**:
  1. Add delete functionality to TaskCard component
  2. Connect to API client for DELETE requests
  3. Implement confirmation dialog
  4. Handle success and error cases
  5. Update UI after successful deletion
- **Files**: `frontend/components/TaskCard.tsx`
- **Acceptance Criteria**:
  - Users can delete tasks successfully
  - Deleted tasks disappear from the UI
  - Confirmation prevents accidental deletions
  - Error handling provides user feedback
- **Dependencies**: Tasks 1.3, 2.1
- **Reference**: spec.md (FR-006), contracts/task-api-contract.md

**Task 4.3: Implement Task Completion Toggle**
- **Objective**: Enable users to mark tasks as complete/incomplete
- **Steps**:
  1. Add toggle functionality to TaskCard component
  2. Connect to API client for PATCH requests to toggle completion
  3. Handle success and error cases
  4. Update UI after successful toggle (apply strikethrough + faded styling per FR-014)
- **Files**: `frontend/components/TaskCard.tsx`
- **Acceptance Criteria**:
  - Users can toggle task completion status
  - UI updates immediately to reflect status change (strikethrough + faded per FR-014)
  - Error handling provides user feedback
  - Changes persist in the backend
- **Dependencies**: Tasks 1.3, 2.1
- **Reference**: spec.md (FR-007, FR-014), contracts/task-api-contract.md

### Phase 5: Error Handling and Polish

**Task 5.1: Implement Global Error Handling**
- **Objective**: Add comprehensive error handling throughout the application
- **Steps**:
  1. Create error boundary components
  2. Implement consistent error display (inline per FR-012)
  3. Handle API errors gracefully
  4. Add 401 handling for expired tokens (redirect to login per FR-017)
  5. Add 403 handling for unauthorized access (per FR-018)
- **Files**: `frontend/app/error.tsx`, `frontend/app/not-found.tsx`, `frontend/components/ErrorBoundary.tsx`
- **Acceptance Criteria**:
  - Errors are displayed in a user-friendly way (inline per FR-012)
  - Application doesn't crash on errors
  - Expired tokens redirect to login (per FR-017)
  - 403 errors show "Access denied" message (per FR-018)
  - Error messages provide helpful guidance
- **Dependencies**: All previous tasks
- **Reference**: spec.md (FR-008, FR-009, FR-012, FR-017, FR-018), plan.md
- **Note**: Removed offline queue/sync requirement (out of scope per Constitution v3.1.1)

**Task 5.2: Implement Loading States and User Feedback**
- **Objective**: Add loading indicators and user feedback for all operations
- **Steps**:
  1. Create loading spinner component
  2. Add loading states to all API calls
  3. Implement success feedback (toasts, messages)
  4. Add skeleton loaders for better perceived performance
- **Files**: `frontend/components/LoadingSpinner.tsx`, `frontend/components/Toast.tsx`, `frontend/hooks/useApiStatus.ts`
- **Acceptance Criteria**:
  - Loading states are shown during all API operations
  - Success feedback appears after successful operations
  - UI remains responsive during operations
  - Loading states are visually consistent
- **Dependencies**: All previous tasks
- **Reference**: spec.md (FR-008), plan.md
- **Note**: AuthProvider and useApiStatus hook exist; no separate useTasks or useAuth hooks needed

**Task 5.3: Final Responsiveness and Accessibility**
- **Objective**: Ensure the application works perfectly on all devices and is accessible
- **Steps**:
  1. Test responsive design on multiple screen sizes (320px to 2560px per SC-005)
  2. Implement accessibility features (ARIA labels, keyboard navigation)
  3. Optimize for performance
  4. Conduct final UI review
- **Files**: All component files for styling adjustments
- **Acceptance Criteria**:
  - Application works on screen sizes from 320px to 2560px (per spec SC-005)
  - Keyboard navigation works properly
  - Screen readers can interpret the interface
  - Mobile-first responsive design implemented (per FR-011)
- **Dependencies**: All previous tasks
- **Reference**: spec.md (FR-010, FR-011, SC-005), plan.md

**Task 5.4: Implement Concurrent Update Handling**
- **Objective**: Handle edge case where multiple users update the same task simultaneously
- **Steps**:
  1. Implement last-write-wins strategy (accept backend's authoritative response)
  2. Update local UI state with backend response after every successful update
  3. Ensure UI always reflects the final state returned by API
  4. Add logging for debugging concurrent update scenarios
- **Files**: `frontend/lib/api.ts`, `frontend/components/TaskForm.tsx`, `frontend/app/tasks/[id]/page.tsx`
- **Acceptance Criteria**:
  - When two users update the same task, the last update persists (per backend logic)
  - UI reflects the final state from backend response, not optimistic local state
  - No data corruption occurs from race conditions
  - User sees the task in its final state after update completes
- **Dependencies**: Tasks 4.1, 5.1
- **Reference**: spec.md (FR-019, edge case: concurrent updates)

**Task 5.5: Implement Unauthorized Access Handling**
- **Objective**: Handle edge case where user attempts to access another user's tasks (403 response)
- **Steps**:
  1. Add 403 error handling to API client (`lib/api.ts`)
  2. Display user-friendly error message: "Access denied - you can only view your own tasks"
  3. Prevent modification attempts when 403 is detected
  4. Log unauthorized access attempts to console for debugging
  5. Optionally redirect to task list page if viewing invalid task detail page
- **Files**: `frontend/lib/api.ts`, `frontend/components/ErrorBoundary.tsx`, `frontend/app/tasks/[id]/page.tsx`
- **Acceptance Criteria**:
  - 403 responses display appropriate error message to user
  - User cannot modify tasks they don't own
  - Unauthorized attempts are logged for security monitoring
  - User experience is graceful (no crashes or broken UI)
- **Dependencies**: Task 5.1 (error handling)
- **Reference**: spec.md (FR-018, edge case: unauthorized access)

**Task 5.6: Implement Proactive JWT Token Refresh**
- **Objective**: Prevent 401 errors by refreshing JWT tokens before expiration
- **Steps**:
  1. Parse JWT token expiration time from token payload
  2. Set up timer to refresh token 5 minutes before expiration
  3. Call Better Auth refresh endpoint to obtain new token
  4. Update stored token silently without user interruption
  5. Handle refresh failures by redirecting to login
- **Files**: `frontend/lib/auth-client.ts`, `frontend/components/AuthProvider.tsx`
- **Acceptance Criteria**:
  - Tokens refresh automatically before expiration during active sessions
  - Users don't experience unexpected 401 errors during normal usage
  - Failed refresh attempts redirect user to login page
  - Token refresh happens silently in background
- **Dependencies**: Task 1.2 (Better Auth integration)
- **Reference**: spec.md (FR-017), plan.md (JWT token handling)
- **Priority**: HIGH - prevents poor user experience from sudden session expiration

**Task 5.7: Document Performance Expectations for SC-004**
- **Objective**: Document measurement methodology for 3-second load time requirement
- **Steps**:
  1. Create performance testing documentation in `specs/003-todo-frontend/performance-testing.md`
  2. Document how to measure "DOMContentLoaded" to "all tasks rendered" time
  3. Document test conditions: 50 tasks in database, 10 page loads
  4. Document Browser DevTools Performance tab usage
  5. Document success criteria: average load time ≤3 seconds
  6. Include baseline measurements from current implementation
- **Files**: `specs/003-todo-frontend/performance-testing.md`
- **Acceptance Criteria**:
  - Documentation clearly explains SC-004 measurement methodology
  - Step-by-step instructions for running performance tests
  - Success criteria explicitly stated
  - Test conditions documented (50 tasks, 10 loads)
  - Baseline measurements included for reference
- **Dependencies**: Tasks 3.1, 5.3
- **Reference**: spec.md (SC-004 and SC-004 Measurement Methodology)
- **Note**: Documentation only - no optimization work required at this stage

## Implementation Order
1. Complete Phase 1 (Project setup and authentication)
2. Complete Phase 2 (Core UI components)
3. Complete Phase 3 (Task management pages with inline forms)
4. Complete Phase 4 (Task operations)
5. Complete Phase 5 (Error handling and polish)

## Quality Assurance
- Each task must pass its acceptance criteria before moving to the next
- All API integrations must use the centralized API client
- All components must be responsive and follow Tailwind CSS patterns
- Authentication must be handled consistently throughout the application
- Error handling must be graceful and user-friendly (inline per FR-012)
- All forms must be inline (per FR-013) - no separate page routes for create/update

## Success Metrics
- All CRUD operations work end-to-end (per spec SC-001: under 30 seconds from action to UI update)
- 95% of API requests succeed with proper error handling (per spec SC-002)
- 90% of users successfully complete task creation on first attempt (per spec SC-003)
- Application loads and displays user's tasks within 3 seconds (per spec SC-004)
- UI is responsive on screen sizes 320px-2560px (per spec SC-005)
- All authenticated user actions result in proper backend API calls with JWT tokens (per spec SC-006)

## Changes from Original Tasks (2026-02-06)

### Removed (Out of Scope per Constitution v3.1.1):
- ❌ Task 3.3: "Create dedicated page `/app/(tasks)/new/page.tsx`" - Replaced with inline form in Task 3.1
- ❌ Task 5.1 Step 5: "Implement offline connectivity handling" - Removed (offline queue out of scope)
- ❌ Task 5.1 Acceptance: "Offline operations queue and sync" - Removed
- ❌ References to `/hooks/useTasks.ts` - Does not exist; useApiStatus used instead
- ❌ References to `/hooks/useAuth.ts` - Does not exist; AuthProvider context used directly

### Updated:
- ✅ Task 1.2: Updated Better Auth route to `/api/auth/[...all]/route.ts` (matches implementation)
- ✅ Task 3.1: Updated to include inline TaskForm rendering (per FR-013)
- ✅ Task 5.1: Removed offline queue, added specific 401/403 handling per FR-017/FR-018
- ✅ All references to "separate dedicated pages" replaced with "inline forms"

### Added:
- ✅ Task 5.7: Document Performance Expectations for SC-004 (measurement only, no optimization)

## Alignment with Refined Specification
- ✅ Constitution v3.1.1 compliant (offline features excluded)
- ✅ FR-013 aligned (inline forms, not dedicated pages)
- ✅ FR-012 aligned (inline error messages)
- ✅ FR-017 aligned (expired token handling)
- ✅ FR-018 aligned (unauthorized access handling)
- ✅ SC-004 measurement documented (Task 5.7)
- ✅ All references to non-existent hooks removed
- ✅ Better Auth route pattern matches actual implementation
