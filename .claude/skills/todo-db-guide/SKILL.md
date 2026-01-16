---
name: "todo-db-guide"
description: "Guide developers to interact with the Todo Full-Stack Web Application database using SQLModel and Neon PostgreSQL. Covers querying, filtering by user, CRUD operations, and best practices for per-user isolation."
version: "1.0.0"
---

# Todo Database Skill

## When to Use This Skill

- User asks about database interaction in the Todo app
- User wants to read or modify task data programmatically
- User needs examples of SQLModel queries with user isolation
- User wants guidance for connecting backend logic to the database

## Procedure

### 1. Summary
Provide a clear approach to interact with the Todo application's database securely, following per-user isolation and SQLModel patterns.

### 2. Prerequisites
- Python 3.11+
- FastAPI backend running
- SQLModel installed (`pip install sqlmodel`)
- Access to the Neon PostgreSQL connection string via `DATABASE_URL`
- Existing database models for `users` and `tasks`
- JWT authentication dependency providing `current_user`

### 3. Step-by-Step Instructions

#### a. Connect to the Database
```python
from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
