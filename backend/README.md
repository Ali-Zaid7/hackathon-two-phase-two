# Backend Database Layer

This directory contains the SQLModel application logic and Alembic migrations for the Todo App.

## Setup

1. Install dependencies:
   ```bash
   uv sync
   # OR
   pip install sqlmodel alembic psycopg2-binary pydantic-settings python-dotenv
   ```

2. Configure `.env` (see `.env.example`).
   - You MUST set `DATABASE_URL` to a valid Neon PostgreSQL connection string to run migrations.

## Migrations

To apply the schema to the database:

```bash
cd backend
alembic upgrade head
```

To create a new migration after changing models:

```bash
cd backend
alembic revision --autogenerate -m "Description"
```

## Verification

To run logic verification (using temporary SQLite):

```bash
python scripts/verify_db.py
```

## Structure

- `app/models/`: SQLModel definitions.
- `app/core/`: Database connection logic.
- `alembic/`: Migration scripts.
