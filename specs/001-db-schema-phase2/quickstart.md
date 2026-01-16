# Quickstart: Database Layer

## Prerequisites

- Python 3.12+
- `sqlmodel`
- `alembic` (for migrations)
- `psycopg2-binary` or `asyncpg` (driver)

## Usage

### 1. Defining the DB Engine

```python
from sqlmodel import create_engine, SQLModel

# Use Neon connection string
DATABASE_URL = "postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require"
engine = create_engine(DATABASE_URL, echo=True)
```

### 2. Creating Tables (Dev/Test only)

For production, use Alembic. For quick testing:

```python
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

### 3. Creating a Task

```python
from app.models.task import Task

def create_task_logic(user_id: str, title: str):
    task = Task(title=title, user_id=user_id)
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
```

### 4. Querying User Tasks

```python
from sqlmodel import Session, select
from app.models.task import Task

def get_user_tasks(user_id: str):
    with Session(engine) as session:
        # Filtering by user_id is MANDATORY for isolation
        statement = select(Task).where(Task.user_id == user_id)
        results = session.exec(statement)
        return results.all()
```
