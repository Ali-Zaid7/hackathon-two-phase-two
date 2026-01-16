# Implementation Tasks: Database Layer Phase II

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Phase**: `001-db-schema-phase2`

## Implementation Strategy
- **Token-Only Auth**: We are sticking to the Spec/Plan decision to **not** create a local `users` table. The `user_id` in `tasks` will be a logical reference (String) to the ID from Better Auth tokens. This deviates from the user input sample text but aligns with the ratified Spec/Constitution.
- **Backend Structure**: We encourage creating the `backend/` directory structure now to house the database logic, even though full API implementation is in the next cycle.

## Phase 1: Setup

- [ ] T001 Create backend directory structure (`backend/app/models`, `backend/app/core`)
- [ ] T002 Install dependencies (`sqlmodel`, `psycopg2-binary`, `alembic`, `pydantic-settings`) in `pyproject.toml` or `backend/requirements.txt`
- [ ] T003 Configure environment variables (`DATABASE_URL`) in `.env` (create example)

## Phase 2: Foundation

- [ ] T004 Initialize Alembic in `backend/` (`alembic init alembic`)
- [ ] T005 Configure `backend/alembic.ini` to use environment variable for DB URL
- [ ] T006 Implement database connection logic in `backend/app/core/db.py` (Engine creation)

## Phase 3: User Story 1 & 2 - Task Persistence & Isolation

**Goal**: Create the Tasks schema capable of storing user-isolated items.

- [ ] T007 [US1] Create `Task` SQLModel class in `backend/app/models/task.py` matching `data-model.md`
- [ ] T008 [US1] Create `backend/app/models/__init__.py` exporting the Task model
- [ ] T009 [US1] Generate initial Alembic migration for `tasks` table
- [ ] T010 [US1] Apply migration to the database (Verify connection)
- [ ] T011 [US1] Create a verification script `backend/scripts/verify_db.py` to create a sample task
- [ ] T012 [P] [US1] Run verification script and confirm Task UUID generation
- [ ] T013 [P] [US2] Verify `user_id` is required (Negative test in verification script)

## Phase 4: User Story 3 - Performance & Integrity

**Goal**: Ensure indexes exist and timestamps work.

- [ ] T014 [US3] Inspect database schema (using `psql` or python inspector) to confirm `idx_user_id` exists
- [ ] T015 [US3] Verify `created_at` and `updated_at` are populated in UTC (add check to verification script)
- [ ] T016 [US3] Update verification script to fetch tasks filtered by `user_id` (Index usage check)

## Phase 5: Final Polish

- [ ] T017 Create `README.md` in `backend/` explaining how to run migrations
- [ ] T018 Scan code for hardcoded secrets or non-UTC timestamps

## Deployment Dependencies

1. **Setup** (T001-T003) must complete first.
2. **Foundation** (T004-T006) depends on Setup.
3. **US1/2** (T007-T013) depends on Foundation.
4. **US3** (T014-T016) depends on US1/2.
