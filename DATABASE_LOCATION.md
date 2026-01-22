# Database Location & Configuration Guide

## 🎯 Where is the Database?

The database is **NOT a local file** in your project folder. It's a **remote PostgreSQL database** hosted on **Neon Cloud**.

### Current Configuration

| Property | Value |
|----------|-------|
| **Database Type** | PostgreSQL (relational database) |
| **Hosting Provider** | Neon (PostgreSQL serverless platform) |
| **Host** | `ep-sweet-waterfall-ahxqlrwr-pooler.c-3.us-east-1.aws.neon.tech` |
| **Database Name** | `phase-2-final` |
| **Port** | 5432 (default PostgreSQL port) |
| **Region** | us-east-1 (AWS Virginia) |
| **Connection Mode** | SSL encrypted (sslmode=require) |
| **Owner** | `neondb_owner` |

---

## 📂 How the Database is Connected

### Connection Flow

```
Your Backend Code
    ↓
app/core/db.py (reads DATABASE_URL from .env)
    ↓
SQLModel Engine (creates connection pool)
    ↓
Network Connection (HTTPS/SSL)
    ↓
Neon Cloud PostgreSQL Server
    ↓
Database: phase-2-final
```

### Key Files

1. **[backend/.env](backend/.env)** ⭐ **CRITICAL**
   - Contains: `DATABASE_URL=postgresql://...`
   - This is the **connection string** - the secret key to access your database
   - **KEEP THIS SECRET** - Never commit to GitHub

2. **[backend/app/core/db.py](backend/app/core/db.py)**
   - Reads `DATABASE_URL` from environment
   - Creates SQLModel engine
   - Provides `get_session()` for database access
   ```python
   DATABASE_URL = os.environ.get("DATABASE_URL")
   engine = create_engine(DATABASE_URL, echo=True)
   ```

3. **[backend/alembic/env.py](backend/alembic/env.py)**
   - Uses same `DATABASE_URL` for migrations
   - Applies schema changes to remote database

---

## 📖 Understanding the Connection String

Your DATABASE_URL is a PostgreSQL connection string:

```
postgresql://neondb_owner:npg_UgPZCY2KJB9I@ep-sweet-waterfall-ahxqlrwr-pooler.c-3.us-east-1.aws.neon.tech/phase-2-final?sslmode=require
          ↓                    ↓                                        ↓                              ↓              ↓
        user                password                              host:pooler                    database        SSL mode
```

### Components

| Part | Meaning |
|------|---------|
| `postgresql://` | Protocol (PostgreSQL) |
| `neondb_owner` | Username |
| `npg_UgPZCY2KJB9I` | Password (API key) |
| `ep-sweet-waterfall-ahxqlrwr-pooler.c-3.us-east-1.aws.neon.tech` | Neon database host |
| `phase-2-final` | Database name |
| `sslmode=require` | Enforce encrypted connection |

---

## 🗄️ Database Schema

The database contains the following table (created by Alembic migrations):

### Table: `tasks`

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(NULL),
    is_completed BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIMEZONE NOT NULL,
    updated_at TIMESTAMP WITH TIMEZONE NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_id_created_at ON tasks(user_id, created_at DESC);
```

### Current Data

The database stores:
- **Tasks**: All user tasks with title, description, priority, completion status
- **Users**: Managed by Better Auth (separate auth system)
- Each task linked to a user via `user_id`

---

## 🔌 How to Access the Database

### Option 1: From Backend Application (Python)
The backend automatically connects via `app/core/db.py`:

```python
from app.core.db import get_session

# Inside a FastAPI endpoint
async def list_tasks(session: Session = Depends(get_session)):
    tasks = session.exec(select(Task)).all()
    return tasks
```

### Option 2: From Neon Web Console
1. Visit [https://console.neon.tech](https://console.neon.tech)
2. Login with your Neon account
3. Navigate to your project → Database browser
4. Query the database directly

### Option 3: From Command Line (psql)
```bash
# If you have PostgreSQL installed locally
psql postgresql://neondb_owner:npg_UgPZCY2KJB9I@ep-sweet-waterfall-ahxqlrwr-pooler.c-3.us-east-1.aws.neon.tech/phase-2-final?sslmode=require

# List tables
\dt

# Query tasks
SELECT * FROM tasks;
```

### Option 4: From DBeaver (GUI Client)
1. Install [DBeaver](https://dbeaver.io/) (free)
2. Create new connection → PostgreSQL
3. Host: `ep-sweet-waterfall-ahxqlrwr-pooler.c-3.us-east-1.aws.neon.tech`
4. User: `neondb_owner`
5. Password: `npg_UgPZCY2KJB9I`
6. Database: `phase-2-final`
7. Enable SSL mode
8. Test connection and browse tables

---

## 🔑 Security Notes

### ⚠️ CRITICAL: Environment Variables

The `.env` file contains **secrets**:

```dotenv
DATABASE_URL=postgresql://neondb_owner:npg_UgPZCY2KJB9I@...
BETTER_AUTH_SECRET=376c7c29a7a3576036cce907a0fc6b9e8c75a8a620e979328832dddc84800638
```

### Security Checklist

- ✅ `.env` is in `.gitignore` (NOT committed to GitHub)
- ✅ Never share `.env` contents publicly
- ✅ Don't hardcode secrets in code
- ✅ Use `.env.example` as template (without secrets)
- ✅ Database uses SSL encryption (sslmode=require)
- ✅ Strong password for Neon account

---

## 📊 Database Operations

### Viewing Data

```bash
# List all tasks
SELECT * FROM tasks;

# Tasks for specific user
SELECT * FROM tasks WHERE user_id = 'user-123';

# Count tasks
SELECT COUNT(*) FROM tasks;

# Recently created tasks
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;
```

### Alembic Migrations

All schema changes go through Alembic:

```bash
cd backend

# View migration status
alembic current

# Apply all migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Generate new migration from model changes
alembic revision --autogenerate -m "description"
```

---

## 🚀 How Data Flows

```
1. Frontend (React/Next.js)
   └─ User creates task: POST /api/tasks
      └─ { "title": "Buy milk", "priority": 1 }

2. Backend (FastAPI)
   └─ Route handler validates and saves

3. Database Connection
   └─ app/core/db.py creates session
   └─ SQLModel validates data
   └─ SQL query sent to Neon

4. Neon Cloud Database
   └─ PostgreSQL stores in phase-2-final.tasks table
   └─ Auto-generates UUID and timestamps

5. Response
   └─ Backend returns created task with id
   └─ Frontend receives: { "id": "uuid-...", "title": "Buy milk", ... }
```

---

## 🐛 Debugging Database Issues

### Issue: "could not connect to server"

**Cause**: Database server unreachable

**Solutions**:
1. Check `.env` has correct DATABASE_URL
2. Verify internet connection
3. Check Neon status: [https://status.neon.tech](https://status.neon.tech)
4. Try psql directly: 
   ```bash
   psql $DATABASE_URL
   ```

### Issue: "permission denied for schema public"

**Cause**: Database user doesn't have permissions

**Solutions**:
1. Verify credentials in DATABASE_URL
2. Check Neon console for user permissions
3. Regenerate API key in Neon dashboard

### Issue: "SSL connection error"

**Cause**: SSL configuration mismatch

**Solutions**:
1. Verify `sslmode=require` in DATABASE_URL
2. Ensure Neon SSL is enabled
3. Update PostgreSQL certificates: `pip install --upgrade certifi`

### Issue: "table 'tasks' does not exist"

**Cause**: Migrations not applied

**Solutions**:
```bash
cd backend
alembic upgrade head
python scripts/verify_db.py
```

### Issue: "no such table: tasks" (SQLite error)

**Cause**: Wrong database URL (using SQLite instead of PostgreSQL)

**Solutions**:
1. Check DATABASE_URL starts with `postgresql://`
2. Not `sqlite:///` 
3. Update `.env` with correct Neon URL

---

## 📋 Summary

| Aspect | Details |
|--------|---------|
| **Where** | Neon Cloud (hosted PostgreSQL) |
| **Location** | us-east-1 AWS region |
| **Access** | Via CONNECTION_URL in `.env` |
| **Connection Code** | [app/core/db.py](app/core/db.py) |
| **Schema Mgmt** | [alembic/](alembic/) (migrations) |
| **Tables** | `tasks` (see schema above) |
| **Security** | SSL encrypted, secret kept in `.env` |
| **Connection Method** | SQLModel ORM with SQLAlchemy |

---

## 🔗 Related Files

- [backend/.env](backend/.env) - Database URL and secrets
- [backend/app/core/db.py](backend/app/core/db.py) - Connection setup
- [backend/alembic/env.py](backend/alembic/env.py) - Migration configuration
- [backend/alembic/versions/32727ae20575_initial_tasks_table.py](backend/alembic/versions/32727ae20575_initial_tasks_table.py) - Initial schema
- [backend/scripts/verify_db.py](backend/scripts/verify_db.py) - Test database connectivity
- [backend/BACKEND_GUIDE.md](backend/BACKEND_GUIDE.md) - Detailed backend documentation

---

## 🔗 Useful Links

- **Neon Dashboard**: [https://console.neon.tech](https://console.neon.tech)
- **Neon Status**: [https://status.neon.tech](https://status.neon.tech)
- **PostgreSQL Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **DBeaver (GUI Client)**: [https://dbeaver.io/](https://dbeaver.io/)
