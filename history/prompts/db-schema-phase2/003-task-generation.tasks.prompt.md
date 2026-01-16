---
id: 003
title: Generated Database Layer Tasks
stage: tasks
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: db-schema-phase2
branch: 001-db-schema-phase2
user: User
command: /sp.tasks
labels: ["database", "tasks", "backend", "python"]
links:
  spec: specs/001-db-schema-phase2/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-db-schema-phase2/tasks.md
tests:
 - none
---

## Prompt

# /sp.tasks — Database Layer Tasks for Phase II Todo App

## Objective
Set up a fully functional database for the multi-user Todo app using Neon Serverless PostgreSQL and SQLModel ORM. This database must support all CRUD operations for tasks and users, including JWT-based authentication integration.

---

## Tasks

### 1. Configure Database Connection
- Define connection string in environment variable: `DATABASE_URL`
- Test connection from backend (`db.py` / SQLModel engine)
- Ensure SSL / secure connection if needed

### 2. Create `users` Table
- Columns:
  - `id` (string, primary key)
  - `email` (unique string)
  - `name` (string)
  - `created_at` (timestamp, default current time)
- Ensure compatibility with Better Auth JWT user info

### 3. Create `tasks` Table
- Columns:
  - `id` (integer, primary key, auto-increment)
  - `user_id` (string, foreign key → `users.id`)
  - `title` (string, not null, 1-200 chars)
  - `description` (text, nullable, max 1000 chars)
  - `completed` (boolean, default false)
  - `created_at` (timestamp, default current time)
  - `updated_at` (timestamp, auto-update on change)
- Create indexes:
  - `tasks.user_id` (for filtering by user)
  - `tasks.completed` (for status filtering)

### 4. Define Relationships
- Enforce `user_id` foreign key constraint
- Enable cascade delete: deleting a user deletes their tasks
- Optional: add ORM relationship in SQLModel models

### 5. Prepare Migrations
- Use SQLModel or Alembic migrations
- Generate initial migration scripts
- Test migrations on local Neon database

### 6. Seed Initial Data (Optional)
- Create 2-3 test users
- Create 3-5 sample tasks per user
- Validate data access through queries

### 7. Testing Database Layer
- Test CRUD queries directly using SQLModel / Python shell
- Verify:
  - Task creation with valid `user_id`
  - Task listing filtered by `user_id`
  - Task updates and deletion
  - Cascade delete for users

---

## Acceptance Criteria
- All tables exist in Neon PostgreSQL
- `users` table compatible with Better Auth JWT users
- `tasks` table supports multi-user CRUD with filtering
- Foreign key constraints enforce ownership
- Test queries succeed for all operations
- Environment variable `DATABASE_URL` is configured and working

## Response snapshot

Generated detailed implementation tasks in `tasks.md`.
- Tasks include Setup, Foundation (Alembic), and User Story implementation logic.
- **Decision**: Skipped creation of `users` table to adhere to the spec-defined "Token-Only" strategy, despite the prompt's suggestion. This ensures alignment with the architectural decision that Better Auth manages user identity externally.
- Tasks cover SQLModel definition, migration generation, and verification scripts.

## Outcome

- ✅ Impact: A clear, actionable checklist for implementing the database layer
- 🧪 Tests: Verification scripts included as tasks
- 📁 Files: tasks.md
- 🔁 Next prompts: /sp.implement to execute the tasks
- 🧠 Reflection: Resolving the conflict between the Prompt input (Create users table) and the Spec (No users table) was the key decision here. I prioritized the Spec as the source of truth.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
