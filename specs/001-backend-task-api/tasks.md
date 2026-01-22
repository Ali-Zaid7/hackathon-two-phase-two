# Implementation Tasks: Backend Task API (001-backend-task-api)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Implementation Strategy
MVP: Complete US1 (List Tasks) first for basic functionality. All endpoints use JWT dependency. Filter every query by user_id from token. Extend existing backend/app structure.

## Phase 1: Setup

- [ ] T001 Add FastAPI and JWT deps to pyproject.toml (`fastapi`, `python-jose[cryptography]`, `python-multipart`)
- [ ] T002 Create backend/app/schemas/__init__.py

## Phase 2: Foundation

- [ ] T003 Create backend/app/schemas/task.py with TaskCreate, TaskUpdate, TaskResponse Pydantic models
- [ ] T004 Create backend/app/dependencies.py with get_current_user dependency (JWT decode from sub claim)
- [ ] T005 Create backend/app/main.py with FastAPI app, include_router for tasks, CORS

## Phase 3: User Story 1 - List Tasks (P1)

**Goal**: Authenticated users can list their tasks.

**Independent Test**: curl GET /api/tasks with valid JWT returns user's tasks only.

- [ ] T006 Create backend/app/routers/__init__.py
- [ ] T007 [P] Create backend/app/routers/tasks.py with GET /api/tasks endpoint (filter by user_id, sorted created_at DESC)
- [ ] T008 [US1] Add router to main.py: app.include_router(tasks_router, prefix="/api", dependencies=[Depends(get_current_user)])

## Phase 4: User Story 2 - Create Task (P1)

**Goal**: Authenticated users can create tasks.

**Independent Test**: POST /api/tasks with data returns new task.

- [ ] T009 [US2] Add POST /api/tasks to backend/app/routers/tasks.py (set user_id from token)

## Phase 5: User Story 3 - View/Update Task (P2)

**Goal**: Users can view/update own tasks.

**Independent Test**: GET/PUT /api/tasks/{id} succeeds for owner.

- [ ] T010 [US3] Add GET /api/tasks/{id} to backend/app/routers/tasks.py (ownership check)
- [ ] T011 [US3] Add PUT /api/tasks/{id} to backend/app/routers/tasks.py (full update, ownership)

## Phase 6: User Story 4 - Delete Task (P2)

**Goal**: Users can delete own tasks.

**Independent Test**: DELETE /api/tasks/{id} removes task.

- [ ] T012 [US4] Add DELETE /api/tasks/{id} to backend/app/routers/tasks.py (ownership)

## Phase 7: User Story 5 - Toggle Completion (P3)

**Goal**: Users can toggle task completion.

**Independent Test**: PATCH /api/tasks/{id}/complete flips status.

- [ ] T013 [US5] Add PATCH /api/tasks/{id}/complete to backend/app/routers/tasks.py (toggle is_completed)

## Phase 8: Polish

- [ ] T014 Add error handling middleware to main.py (standard JSON errors)
- [ ] T015 Create backend/app/routers/tasks_test.py with pytest examples for endpoints

## Dependencies
1. Setup → Foundation → All US
2. US independent except shared deps.

**Total Tasks**: 15 | **Parallel Opportunities**: T001-T002, T007 | **MVP**: Phase 1-3 (List + Create)