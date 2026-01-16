# Database Schema Specification

> **Status**: Approved for Phase II
> **Last Updated**: 2026-01-16
> **Clarifications Session**: 2026-01-16

## 1. Overview
This specification defines the database schema for the Phase II Todo Full-Stack Web Application. The database is **Neon Serverless PostgreSQL**. The ORM is **SQLModel**.

## 2. Clarifications (Session 2026-01-16)
- **Q: How does backend interact with 'users'?**
  - **A: Token-Only strategy:** No local `users` table exists in the backend database. The backend trusts the JWT (managed by Better Auth) and extracts the `user_id` directly from the token. All ownership is based on this string ID.
- **Q: Timestamp standard?**
  - **A: UTC Aware:** All `datetime` fields must use timezone-aware UTC timestamps.
- **Q: How is 'updated_at' handled?**
  - **A: Database Trigger:** Updates are handled automatically by a PostgreSQL trigger function (`moddatetime` extension or custom function) to ensure correctness on every write.
- **Q: Deletion strategy?**
  - **A: Hard Delete:** Records are physically removed from the table upon deletion (GDPR "right to be forgotten" compliant).
- **Q: Migration Management?**
  - **A: Alembic:** All schema changes must be versioned and applied using Alembic migrations.

## 3. Core Entities

### 3.1 Tasks Table (`tasks`)
Stores individual todo items for users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `UUID` | No | `uuid_generate_v4()` | Primary Key (auto-generated) |
| `user_id` | `VARCHAR` | No | - | **Owner ID** (Partition Key) - Derived from JWT |
| `title` | `VARCHAR(255)` | No | - | Main task description |
| `is_completed` | `BOOLEAN` | No | `FALSE` | Completion status |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Creation timestamp (UTC) |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Last update timestamp (UTC) |

**Constraints:**
- **Primary Key**: `id`
- **Ownership**: `user_id` MUST be present.
- **Data Integrity**: `title` cannot be empty string.

**Indexes:**
- `idx_tasks_user_id` on `(user_id)` (Crucial for filtering: `WHERE user_id = ?`)
- `idx_tasks_user_id_created_at` on `(user_id, created_at DESC)` (Optimization for "My Latest Tasks")

## 4. Migration Strategy
- Use **Alembic** for all changes.
- **Initial Migration**:
  1. Enable `uuid-ossp` extension (if needed for DB-side UUIDs).
  2. Create `update_updated_at_column` function.
  3. Create `tasks` table.
  4. Create indexes.
  5. Create trigger for `updated_at`.

## 5. Security & Isolation
- **Row-Level Security (Concept)**: While RLS is not strictly enforced at DB level (connection pool uses shared user), the **Application Layer** acts as the gatekeeper.
- **Hard Invariant**: Every query MUST include `WHERE user_id = :current_user_id`.

## 6. Performance Considerations
- **Neon Serverless**: Connection pooling is vital. Use standard SQLAlchemy pooling or `pgbouncer` compatible settings.
- **Indexes**: Designed to satisfy the most common query: "Get all tasks for this user, sorted by newest first".
