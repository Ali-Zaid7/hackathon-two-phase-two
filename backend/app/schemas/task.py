from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)
    is_completed: bool = False


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    model_config = ConfigDict(from_attributes=True)
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)


class TaskResponse(BaseModel):
    """Schema for task response."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    priority: int
    created_at: datetime
    updated_at: datetime
