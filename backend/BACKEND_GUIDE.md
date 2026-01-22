# Backend Architecture Guide

A comprehensive developer reference for navigating and debugging the Todo App backend API.

---

## 📁 Folder Structure Map

```
backend/
├── alembic/                         # Database migration management (SQLAlchemy Alembic)
│   ├── env.py                       # Alembic configuration and migration runner
│   ├── script.py.mako              # Template for generating new migrations
│   ├── alembic.ini                 # Alembic settings file
│   └── versions/                   # Migration scripts (auto-versioned)
│       └── 32727ae20575_initial_tasks_table.py  # Initial schema migration
├── app/                             # Main FastAPI application package
│   ├── main.py                     # FastAPI app initialization, CORS, routes setup
│   ├── dependencies.py             # JWT authentication & dependency injection
│   ├── __init__.py                 # Package initialization
│   ├── core/                       # Core infrastructure
│   │   └── db.py                   # SQLModel database engine & session factory
│   ├── models/                     # SQLModel ORM models (database tables)
│   │   ├── task.py                 # Task model with fields, indexes, validation
│   │   └── __init__.py             # Package initialization
│   ├── routers/                    # API endpoint handlers (route logic)
│   │   ├── tasks.py                # Task CRUD endpoints (GET, POST, PUT, DELETE)
│   │   ├── tasks_test.py           # Task endpoint integration tests
│   │   └── __init__.py             # Package initialization
│   └── schemas/                    # Pydantic request/response schemas (validation)
│       ├── task.py                 # TaskCreate, TaskUpdate, TaskResponse schemas
│       └── __init__.py             # Package initialization
├── scripts/                         # Utility scripts for development & testing
│   └── verify_db.py                # Database connection & CRUD verification script
├── .env                            # Local environment variables (git-ignored)
├── .env.example                    # Example environment template
├── alembic.ini                     # Alembic configuration
└── README.md                        # Quick start guide
```

---

## 📖 Detailed Folder & File Guide

### 📁 Root Level Configuration Files

#### `.env` & `.env.example`
- **Purpose**: Environment variable management
- **Critical Variables**:
  - `DATABASE_URL` - PostgreSQL connection string (format: `postgresql://user:password@host:port/dbname`)
  - `BETTER_AUTH_SECRET` - JWT signing key (shared with frontend auth service)
- **Security**: `.env` is git-ignored; `.env.example` shows required variables
- **Debugging**: If auth fails, check that `BETTER_AUTH_SECRET` matches frontend. If database doesn't connect, verify `DATABASE_URL`
- **Setup**: Copy `.env.example` to `.env` and fill in values:
  ```bash
  cp .env.example .env
  # Edit .env with actual database URL and JWT secret
  ```

#### `alembic.ini`
- **Purpose**: Database migration tool configuration
- **Key Settings**: Database URL, migration script directory, logging configuration
- **Debugging**: Check this if migrations fail; verify sqlalchemy.url is set correctly (usually via environment variable)

---

### 📁 `/app` - Main FastAPI Application

The heart of the backend. All business logic and API routes live here.

#### **`main.py` - FastAPI App Entry Point**
- **Purpose**: Initialize FastAPI application, configure middleware, register routers
- **Key Components**:
  - **CORS Middleware**: Allows frontend at `http://localhost:3000` to make requests
  - **Health Check Endpoint**: `GET /health` returns `{"status": "healthy"}` for monitoring
  - **Router Registration**: Includes task routes at `/api` prefix
- **Configuration**:
  - Title: "Todo Full-Stack Web Application API"
  - Version: 0.1.0
  - Description: Phase II backend for multi-user task management
- **Debug Checklist**:
  1. Server starts: `python -m uvicorn app.main:app --reload`
  2. Health check responds: `curl http://localhost:8000/health`
  3. Frontend can reach backend (CORS configured correctly)
  4. All routers are included properly

#### **`dependencies.py` - Authentication & Dependency Injection**
- **Purpose**: JWT authentication middleware for protecting endpoints
- **Critical Function**: `get_current_user_id(credentials)`
  - Validates JWT token from Authorization header
  - Extracts `user_id` (subject/sub claim)
  - Returns user_id or raises `401 Unauthorized`
- **Security Features**:
  - Uses `BETTER_AUTH_SECRET` from environment
  - HS256 algorithm for JWT validation
  - HTTPBearer security scheme
  - Comprehensive logging for auth events
- **Auth Flow**:
  1. Frontend sends: `Authorization: Bearer <jwt_token>`
  2. `get_current_user_id` validates token
  3. Returns user_id if valid
  4. Endpoint receives authenticated user_id
- **Debug Issues**:
  - `401 Unauthorized`: Check JWT secret matches frontend, token isn't expired
  - `Could not validate credentials`: JWT format invalid, algorithm mismatch
  - Logs show: `"User authenticated: {user_id}"` on success, warnings on failure

#### 📁 **`/core` - Infrastructure Layer**

##### **`db.py` - Database Engine & Session Management**
- **Purpose**: Configures SQLModel ORM and provides database sessions
- **Key Components**:
  - **`engine`**: SQLAlchemy engine connected to PostgreSQL
  - **`get_session()`**: Dependency that yields database sessions for endpoints
- **SQLModel**:
  - ORM (Object-Relational Mapping) library
  - Combines SQLAlchemy + Pydantic for type safety
  - Automatically validates data before database operations
- **Configuration**:
  - `echo=True` in development - logs all SQL queries to console
  - `echo=False` recommended in production
- **Debug**:
  - If `get_session` fails: Check `DATABASE_URL` in `.env`
  - View generated SQL: Look for echo=True queries in logs
  - Session isolation: Each request gets fresh session (auto-cleanup)

---

#### 📁 **`/models` - ORM Models (Database Tables)**

##### **`task.py` - Task Model**
- **Purpose**: Defines the `tasks` database table structure
- **Table**: `tasks`
- **Fields**:
  | Field | Type | Constraints | Purpose |
  |-------|------|-------------|---------|
  | `id` | UUID | Primary Key | Unique task identifier (auto-generated) |
  | `user_id` | String | Not Null, Indexed | Task owner identifier (links to auth) |
  | `title` | String | Not Null, Max 255 chars | Task name (required) |
  | `description` | String (Optional) | Nullable | Task details (optional) |
  | `priority` | Integer | 1-5 range | Priority level (default: 1, lowest) |
  | `is_completed` | Boolean | Default: False | Completion status |
  | `created_at` | DateTime | Auto-set UTC | Record creation timestamp |
  | `updated_at` | DateTime | Auto-set UTC | Last modification timestamp |

- **Indexes** (Performance Optimization):
  - `idx_tasks_user_id` - Speeds up filtering by user_id
  - `idx_tasks_user_id_created_at` - Optimizes listing/sorting by user and date
- **Validation**:
  - Title: 1-255 characters (enforced at model level)
  - Priority: 1-5 (enforced at model level)
  - Ensures data integrity at database layer
- **Debug**:
  - If task creation fails validation: Check title length and priority range
  - UUID generation: Automatic via `uuid.uuid4()` factory
  - Timestamps: Always UTC timezone-aware

---

#### 📁 **`/schemas` - Pydantic Validation Schemas**

Request/response validators - NOT database models. Schemas validate data before hitting the database.

##### **`task.py` - Task Schemas**
Defines three schemas for different operations:

**`TaskCreate` - Schema for POST /tasks**
- Fields: `title` (required), `description`, `priority`, `is_completed`
- Validation:
  - Title: 1-255 chars, required
  - Priority: 1-5 range, default=1
  - is_completed: default=False
- Purpose: Validates incoming task creation requests

**`TaskUpdate` - Schema for PUT /tasks/{id}**
- Fields: All optional (partial updates)
- Allows updating any combination of title, description, priority, is_completed
- `from_attributes=True` - Converts SQLModel instances to Pydantic

**`TaskResponse` - Schema for all GET/POST/PUT responses**
- Includes all fields: id, user_id, title, description, is_completed, priority, created_at, updated_at
- `from_attributes=True` - Auto-converts SQLModel to Pydantic for JSON serialization
- Purpose: Consistent response format across all endpoints

**Debug**:
- Validation error in response: Check schema constraints match request data
- Missing fields in response: Verify TaskResponse includes all fields needed by frontend

---

#### 📁 **`/routers` - API Endpoint Handlers**

##### **`tasks.py` - Task CRUD Endpoints**
Implements all task operations with JWT protection and authorization.

**Endpoint: `GET /{user_id}/tasks` - List All Tasks**
- **Purpose**: Fetch all tasks for authenticated user
- **Security**: Verifies `user_id` matches authenticated user (prevents cross-user access)
- **Response**: List of `TaskResponse` objects, sorted by creation date (newest first)
- **Debug**: 
  - Empty list = No tasks created yet
  - 403 Forbidden = Trying to access another user's tasks
  - Check logs: `"Listing tasks for user: {user_id}"`

**Endpoint: `POST /{user_id}/tasks` - Create Task**
- **Purpose**: Create new task for authenticated user
- **Request Body**: `TaskCreate` schema (title required, rest optional)
- **Response**: Newly created `TaskResponse` with generated id, timestamps
- **Status Code**: 201 Created
- **Debug**:
  - Validation error: Title exceeds 255 chars or priority out of range
  - 403 Forbidden: Trying to create task for different user
  - Check logs: `"Created task {task_id} for user {user_id}"`

**Endpoint: `GET /{user_id}/tasks/{task_id}` - Get Single Task**
- **Purpose**: Retrieve specific task details
- **Security**: Verifies both user_id and that task belongs to user
- **Response**: `TaskResponse` object
- **Debug**:
  - 404 Not Found: Task doesn't exist or belongs to different user
  - 403 Forbidden: Trying to access another user's task
  - Check logs: `"Retrieved task {task_id} for user {user_id}"`

**Endpoint: `PUT /{user_id}/tasks/{task_id}` - Update Task**
- **Purpose**: Update existing task (all fields optional)
- **Request Body**: `TaskUpdate` schema (any field can be updated)
- **Response**: Updated `TaskResponse`
- **Security**: Same authorization as GET
- **Debug**:
  - 404 Not Found: Task doesn't exist
  - Validation error: Updated values violate constraints (title length, priority range)
  - Check logs: `"Updated task {task_id} for user {user_id}"`

**Endpoint: `DELETE /{user_id}/tasks/{task_id}` - Delete Task** (not shown in excerpt)
- **Purpose**: Remove task
- **Status Code**: 204 No Content
- **Security**: Authorization check required
- **Debug**: 404 if task not found

##### **`tasks_test.py` - Integration Tests**
- **Purpose**: Test task endpoints (list, create, get, update, delete)
- **Runs**: With `pytest` framework
- **Coverage**: CRUD operations, auth checks, edge cases
- **Debug**: Run before deployment to ensure endpoints work

---

### 📁 `/alembic` - Database Migrations

Alembic manages database schema changes safely across environments.

#### **`env.py` - Migration Runtime Configuration**
- **Purpose**: Configures how migrations run
- **Key Functions**:
  - Loads environment variables from `.env`
  - Imports SQLModel models to generate migrations
  - Sets database URL from `DATABASE_URL` env var
  - Runs migrations in online mode (against live database)
- **Debug**:
  - If migrations fail: Check `DATABASE_URL` is correct
  - If models not detected: Ensure models are imported in `env.py`

#### **`versions/` - Migration Scripts**
Contains timestamped migration files for schema changes.

**Example: `32727ae20575_initial_tasks_table.py` - Initial Schema**
- **Purpose**: Creates initial `tasks` table (first migration)
- **What it creates**:
  - `tasks` table with all columns and constraints
  - Indexes on `user_id` and `user_id + created_at`
- **Upgrade**: Runs when migrating forward (new database setup)
- **Downgrade**: Rolls back changes if needed
- **Debug**: 
  - Verify all columns exist: `\d tasks` in psql
  - Check indexes: `\di` in psql

#### **`script.py.mako` - Migration Template**
- **Purpose**: Template for generating new migrations automatically
- **When Used**: Run `alembic revision --autogenerate` to create new migration

#### **`alembic.ini` - Alembic Configuration**
- **Purpose**: Settings for migration system
- **Key Settings**:
  - Script location (migrations folder)
  - sqlalchemy.url (loaded from environment)
  - Migration format and version numbering

---

### 📁 `/scripts` - Development Utilities

#### **`verify_db.py` - Database Verification Script**
- **Purpose**: Test database connectivity and CRUD operations without running full app
- **What It Does**:
  1. Creates in-memory SQLite database
  2. Initializes all models
  3. Runs CRUD operations (create, read, update, delete tasks)
  4. Verifies database operations work correctly
- **Usage**:
  ```bash
  cd backend
  python scripts/verify_db.py
  ```
- **Debug Checklist**:
  - ✅ Script runs without errors = Database layer works
  - ✅ CRUD operations succeed = ORM models are correct
  - ✅ Timestamps auto-generated = Default factories work
- **Note**: Uses SQLite for testing (not PostgreSQL) - safe for CI/development

---

## 🛠️ Common Debugging Workflows

### Issue: Server Won't Start
1. Check Python version: `python --version` (3.10+ required)
2. Activate virtual environment: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Check `main.py` has no syntax errors: `python -m py_compile app/main.py`
5. Run with debug output: `python -m uvicorn app.main:app --reload --log-level debug`

### Issue: Database Connection Fails
1. Verify `.env` exists: `cat .env` (check DATABASE_URL is set)
2. Test database URL: `psql postgresql://user:password@host:port/dbname`
3. Check PostgreSQL server is running
4. Verify schema exists: `alembic upgrade head`
5. Run verification script: `python scripts/verify_db.py`

### Issue: Authentication (401 Unauthorized)
1. Check `BETTER_AUTH_SECRET` in `.env` matches frontend
2. Verify JWT token format: `Authorization: Bearer <token>`
3. Check token expiration (if applicable)
4. Review `dependencies.py` logs for JWT validation errors
5. Test with curl: `curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/user_id/tasks`

### Issue: Task Creation Fails (400 Bad Request)
1. Check request body matches `TaskCreate` schema:
   - `title` is required, 1-255 chars
   - `priority` is 1-5 if provided
   - `description` optional, can be null
2. Verify request Content-Type is `application/json`
3. Check `schemas/task.py` for validation rules
4. Review request in API docs: `http://localhost:8000/docs`

### Issue: Migrations Not Applied
1. Check `alembic.ini` exists and `DATABASE_URL` is set
2. View migration status: `alembic current`
3. Apply migrations: `alembic upgrade head`
4. Check if new migrations exist: `ls alembic/versions/`
5. Create new migration from models: `alembic revision --autogenerate -m "description"`

### Issue: UUID Not Found (404)
1. Verify task UUID format is valid (UUID v4)
2. Check task belongs to authenticated user
3. Verify authorization: `user_id` in URL matches authenticated user
4. Check database directly:
   ```sql
   SELECT * FROM tasks WHERE id = 'your-uuid';
   ```

---

## 🔄 Request/Response Flow

### Task Creation Flow
```
1. Frontend POST /api/{user_id}/tasks
   └─ Body: { "title": "Buy milk", "priority": 1 }

2. FastAPI (main.py)
   └─ Receives request, routes to tasks.py

3. Endpoint Handler (tasks.py:create_task)
   ├─ Validates JWT via get_current_user_id (dependencies.py)
   ├─ Checks user_id matches authenticated user
   ├─ Validates body against TaskCreate schema
   └─ Returns 403 if unauthorized, 400 if invalid

4. Database Layer (models/task.py + core/db.py)
   ├─ Creates Task model instance
   ├─ Validates constraints (title length, priority range)
   ├─ Generates UUID and timestamps
   └─ Inserts into tasks table

5. Response (schemas/task.py:TaskResponse)
   └─ Returns 201 Created with full task object including id, timestamps

6. Frontend receives TaskResponse
   └─ Updates UI with new task
```

---

## 🔐 Authentication & Authorization

### JWT Validation Flow
```
1. Frontend: POST /login → Backend authentication service
2. Backend returns: JWT token (contains sub=user_id)
3. Frontend: Stores token, sends in Authorization header
4. Backend: Receives request with Authorization: Bearer <token>
5. dependencies.py:get_current_user_id
   ├─ Extracts token from header
   ├─ Decodes with BETTER_AUTH_SECRET
   ├─ Verifies HS256 signature
   └─ Returns user_id or raises 401
6. Endpoint: Checks user_id from JWT matches URL parameter
   └─ Returns 403 Forbidden if mismatch
```

### Authorization Rules
- **User Data**: Users can only access their own tasks
- **Cross-User Protection**: All endpoints verify `user_id` in URL matches authenticated user
- **Examples**:
  - ✅ User A: GET /api/user-a-id/tasks (allowed)
  - ❌ User A: GET /api/user-b-id/tasks (403 Forbidden)

---

## 🚀 Development Tips

1. **Use Interactive Docs**: Visit `http://localhost:8000/docs` (Swagger UI) to test endpoints
2. **Check SQL Queries**: Enable `echo=True` in `db.py` to see generated SQL
3. **Review Logs**: Look for auth validation and database query logs
4. **Test Locally First**: Use `verify_db.py` before full app tests
5. **Validate Schemas**: Use Pydantic validators to catch errors early
6. **Add Logging**: Use `logger.info()`, `logger.warning()` for debugging
7. **Use Path Parameters**: UUID fields use `Path(...)` for validation
8. **Dependency Injection**: Use `Depends()` for reusable auth/database logic

---

## 📚 Quick Reference

| File/Folder | Purpose | Critical For |
|---|---|---|
| `app/main.py` | FastAPI app setup | Starting server, CORS config |
| `app/dependencies.py` | JWT authentication | Protected endpoints |
| `app/core/db.py` | Database connection | All database operations |
| `app/models/task.py` | Task database table | Schema definition, validation |
| `app/schemas/task.py` | Request/response validation | API contracts |
| `app/routers/tasks.py` | Task endpoints | CRUD operations |
| `.env` | Environment config | Database URL, JWT secret |
| `alembic/env.py` | Migration setup | Database schema versioning |
| `scripts/verify_db.py` | Testing database layer | Debugging CRUD operations |

---

## 🔗 Related Documentation

- **Frontend**: See `frontend/FRONTEND_GUIDE.md` for React client details
- **Database**: See `database/schema.md` for full data model
- **Integration Testing**: See `specs/001-integration-testing/` for test contracts
- **API Docs**: Run server and visit `http://localhost:8000/docs` for interactive API documentation

---

## 🏃 Quick Start Commands

```bash
# Setup
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with DATABASE_URL and BETTER_AUTH_SECRET

# Database
alembic upgrade head  # Apply migrations

# Development
python -m uvicorn app.main:app --reload

# Verify database works
python scripts/verify_db.py

# Run tests
pytest app/routers/tasks_test.py -v

# Check API docs
# Open browser: http://localhost:8000/docs
```
