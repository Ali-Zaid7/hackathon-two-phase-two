# Implementation Plan: Backend FastAPI Task API (001-backend-task-api)

**Feature Branch**: `001-backend-task-api`
**Date**: 2026-01-17
**Status**: Draft
**Dependencies**: Database schema (specs/database/schema.md, backend/app/models/task.py), Better Auth JWT integration (frontend-managed, backend verifies tokens).
**Overview**: This plan details the architecture and step-by-step implementation for a secure, per-user CRUD REST API for tasks using FastAPI, SQLModel, and JWT authentication. It adheres to the token-only strategy (no local users table), enforces user_id filtering on all operations, and follows existing DB schema (tasks table with UUID id, user_id as owner key, indexes on user_id/created_at).

## 1. Scope and Dependencies

### In Scope
- Implement 6 RESTful endpoints: GET/POST /api/{user_id}/tasks, GET/PUT/DELETE /api/{user_id}/tasks/{id}, PATCH /api/{user_id}/tasks/{id}/complete.
- JWT middleware/dependency to extract and validate user_id from Authorization: Bearer token.
- Pydantic schemas for request/response validation (TaskCreate, TaskUpdate, TaskResponse).
- CRUD operations with SQLModel, always filtering by `user_id == current_user_id`.
- Basic error handling (404 for not found, 403 for unauthorized access attempts, 422 validation).
- Dependency injection for database session.

### Out of Scope
- User management (signup/signin handled by Better Auth frontend).
- Pagination/sorting (add in future phase; default to all tasks sorted by created_at DESC).
- Advanced features (attachments, subtasks, sharing).
- Full test suite (unit/integration deferred to tasks.md).
- Deployment (Docker, env vars for DATABASE_URL, JWT_SECRET).

### External Dependencies
- **Neon PostgreSQL**: Connection via SQLAlchemy/SQLModel (alembic migrations already in place).
- **Better Auth JWT**: Shared secret key (from .env), token payload includes `user_id` (string).
- **Libraries**: fastapi, sqlmodel, python-jose[cryptography] (for JWT), passlib (hashing if needed, but token-only).

## 2. Key Decisions and Rationale

### Decisions
1. **JWT Handling**: Custom Depends() dependency over full middleware.
   - **Options**: Full app-wide middleware vs. per-route dependency.
   - **Trade-offs**: Dependency is more granular (endpoint-specific), composable, and FastAPI-native; middleware adds overhead for non-auth routes.
   - **Rationale**: Matches FastAPI best practices (2026 docs emphasize Depends for auth). Reversible via route decorators.

2. **Per-User Filtering**: Hard invariant – every query includes `WHERE user_id = current_user_id`.
   - **Options**: DB Row-Level Security (RLS) vs. app-layer filtering.
   - **Trade-offs**: RLS adds DB complexity (Neon supports but requires session vars); app-layer is simpler, sufficient for token-only auth.
   - **Rationale**: Schema spec mandates app-layer as gatekeeper; indexes optimize user_id queries.

3. **Schemas**: Separate Pydantic models for Create/Update/Response (exclude id/user_id on input).
   - **Rationale**: Prevents client spoofing user_id; Response includes all fields for frontend.

4. **Toggle Complete**: PATCH endpoint for simplicity (vs. PUT full update).
   - **Rationale**: Follows spec; idempotent.

**Principles**: Smallest viable change (extend existing models dir), reversible (feature flags via env), testable (independent endpoints).

**ADR Suggestion**: 📋 Architectural decision detected: JWT dependency vs. middleware for token-only auth. Document reasoning and tradeoffs? Run `/sp.adr jwt-handling-strategy`.

## 3. Interfaces and API Contracts

### Public APIs (OpenAPI auto-generated)
| Method | Endpoint | Input | Output | Errors |
|--------|----------|-------|--------|--------|
| GET | `/api/{user_id}/tasks` | Path: user_id (str) | List[TaskResponse] (created_at DESC) | 403 (unauth), 404 (user mismatch) |
| POST | `/api/{user_id}/tasks` | Path: user_id, Body: TaskCreate (title*, desc?, priority=1) | TaskResponse (201) | 422 (validation), 403 |
| GET | `/api/{user_id}/tasks/{id}` | Path: user_id, id (UUID) | TaskResponse | 404 (not found/mismatch) |
| PUT | `/api/{user_id}/tasks/{id}` | Path: user_id, id; Body: TaskUpdate (partial) | TaskResponse | 404, 422, 403 |
| DELETE | `/api/{user_id}/tasks/{id}` | Path: user_id, id | 204 No Content | 404, 403 |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Path: user_id, id | TaskResponse (toggles is_completed) | 404, 403 |

- **Versioning**: /v1/api/... (prefix in future).
- **Idempotency**: None (UUIDs prevent dupes).
- **Timeouts/Retries**: FastAPI defaults (30s); client-handled.
- **Errors**: JSON {detail: str}, HTTP 4xx/5xx. Taxonomy: ValidationError(422), HTTPException(403/404).

### Pydantic Schemas (data-model.md content)
```python
# backend/app/schemas/task.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime
from .models.task import TaskBase  # Reuse fields

class TaskCreate(TaskBase):
    pass  # title*, desc?, is_completed=False, priority=1 (user_id auto)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = None

class TaskResponse(TaskBase):
    id: UUID
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # SQLModel compat
```

## 4. Non-Functional Requirements (NFRs)
- **Performance**: p95 <100ms/query (user_id index); cap at 100 tasks/list (paginate later).
- **Reliability**: ACID via SQLModel; error budget 1% 5xx.
- **Security**: JWT verify (exp, sig); no SQL inj (SQLModel); rate-limit future.
- **Cost**: Neon serverless scales to zero.

## 5. Data Management
- **Source of Truth**: tasks table (existing schema).
- **Schema Evolution**: Alembic (add cols via migration).
- **Migration**: No data mig needed (greenfield API).

## 6. Operational Readiness
- **Observability**: FastAPI logs; add structlog for user_id traces.
- **Deployment**: uvicorn main:app --reload; Dockerize later.
- **Feature Flags**: Env AUTH_ENABLED=false for dev bypass.

## 7. Risk Analysis
- **Risk 1**: JWT secret mismatch (mitigate: shared .env).
- **Risk 2**: Query perf on large user data (mitigate: indexes exist).
- **Risk 3**: Token spoof (mitigate: verify sig/exp).

## 8. Evaluation and Validation
- **DoD**: All endpoints return 2xx for valid JWT/ops; 4xx otherwise. curl/Postman tests.
- **Validation**: Pydantic + SQLModel constraints.

## Research Summary (research.md content)
- **FastAPI JWT (2026 best practices)**: Use `fastapi.security.HTTPBearer` + `Depends(get_current_user)` func. Decode with `jwt.decode(token, SECRET_KEY, algorithms=[\"HS256\"])`. Extract sub/user_id. Libs: python-jose, authlib. Avoid full libs like fastapi-users (overkill for token-only).
- **Pydantic Schemas**: BaseModel subclasses; response_model=List[TaskResponse]. ORM mode via from_attributes=True.
- **Per-User Filtering**: Dependency returns user_id str → Session.query(Task).filter(Task.user_id == user_id, Task.id == id).first(). Always chain filters.

## Quickstart (quickstart.md content)
1. pip install python-jose[cryptography] python-multipart.
2. Add /app/dependencies.py: get_current_user(token: str) → user_id.
3. Add /app/routers/tasks.py: APIRouter(prefix=\"/api/{user_id}/tasks\").
4. Wire in main.py: app.include_router(tasks_router).
5. Test: curl -H \"Authorization: Bearer <jwt>\" ...

## Implementation Steps (for tasks.md)
1. Create schemas/task.py.
2. Add dependencies/auth.py.
3. Create routers/tasks.py with CRUD.
4. Update main.py router include.
5. Alembic current (no mig).
6. Local tests.

### Critical Files for Implementation
- E:\\humanoid-book\\phase-2\\backend\\app\\models\\task.py - [Existing Task SQLModel; extend for queries]
- E:\\humanoid-book\\phase-2\\backend\\app\\__init__.py - [App entry; likely needs main.py sibling for FastAPI app]
- E:\\humanoid-book\\phase-2\\backend\\alembic\\alembic.ini - [DB config; verify for API]
- E:\\humanoid-book\\phase-2\\backend\\.env - [JWT_SECRET, DATABASE_URL placeholders]
- E:\\humanoid-book\\phase-2\\specs\\database\\schema.md - [DB invariants for filtering]