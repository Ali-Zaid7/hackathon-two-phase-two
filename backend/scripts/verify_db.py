import os
import sys

# Add backend to path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, "..")
sys.path.insert(0, os.path.abspath(backend_dir))
print(f"Added to path: {os.path.abspath(backend_dir)}")

from sqlmodel import Session, SQLModel, create_engine, select
from app.models.task import Task
import uuid

# Use SQLite for local logic verification since no Neon DB is provided yet
# In CI/Prod, this would use the real DATABASE_URL
sqlite_file_name = "verification.db"
if os.path.exists(sqlite_file_name):
    os.remove(sqlite_file_name)

sqlite_url = f"sqlite:///{sqlite_file_name}"

# Check for proper UUID handling
# SQLModel+SQLite handles UUIDs automatically
engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)

def verify_task_crud():
    print("Verifying CRUD...")
    user_id = "user_123"

    # Create
    task = Task(title="Test Task", user_id=user_id)
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)

        print(f"Created Task: {task.id} (User: {task.user_id})")
        assert isinstance(task.id, uuid.UUID)

        # Read
        print("Verifying user filtering...")
        statement = select(Task).where(Task.user_id == user_id)
        results = session.exec(statement).all()
        assert len(results) >= 1
        print("Read verification pass.")

        # Isolation Check (Negative Test)
        print("Verifying isolation...")
        statement2 = select(Task).where(Task.user_id == "other_user")
        results2 = session.exec(statement2).all()
        assert len(results2) == 0
        print("Isolation verification pass.")

        # Update
        print("Verifying update...")
        task.title = "Updated Title"
        session.add(task)
        session.commit()
        session.refresh(task)
        assert task.title == "Updated Title"
        assert task.updated_at >= task.created_at
        print("Update verification pass.")

if __name__ == "__main__":
    create_db_and_tables()
    verify_task_crud()
    print("ALL VERIFICATIONS PASSED")
