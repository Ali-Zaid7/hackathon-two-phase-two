# Data Model

## Logical Entity: Task

Represents a single todo item. Ownership is strictly enforced via `user_id`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary Key. Unique identifier. |
| title | String | Yes | The content of the task. Max 255 chars. |
| description | Text | No | Detailed notes. Unlimited/Large text. |
| is_completed | Boolean | Yes | Status flag. Default False. |
| priority | Integer | No | 1 (Low) to 3 (High). Default 1. |
| user_id | String | Yes | Owner ID. Indexed. |
| created_at | DateTime | Yes | UTC timestamp of creation. |
| updated_at | DateTime | Yes | UTC timestamp of last update. |

## SQLModel Definition (Draft)

```python
import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Index

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    priority: int = Field(default=1)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_user_created", "user_id", "created_at"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(index=True, nullable=False) # Duplicated index=True for clarity, explicit Index above for composite
    created_at: datetime = Field(default_factory=lambda: datetime.now(datetime.UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(datetime.UTC))
```
*Note: `datetime.UTC` requires Python 3.11+. Valid per technical context.*

## Relationships

- **User**: One-to-Many with Tasks.
  - Implemented logically. `Task.user_id` stores the User's ID.
  - No database-level Constraint (due to external Auth).
  - Application logic MUST validate valid `user_id` from JWT.
