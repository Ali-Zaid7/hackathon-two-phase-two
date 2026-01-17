import logging
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from sqlmodel import select
from ..dependencies import get_current_user_id
from ..core.db import get_session
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..models.task import Task

logger = logging.getLogger(__name__)
router = APIRouter(tags=["tasks"])

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized access attempt to user {user_id} by {current_user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: access denied"
        )
    logger.info(f"Listing tasks for user: {current_user_id}")
    statement = select(Task).where(Task.user_id == current_user_id).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    logger.info(f"Found {len(tasks)} tasks for user {current_user_id}")
    return tasks

@router.post("/{user_id}/tasks", status_code=status.HTTP_201_CREATED, response_model=TaskResponse)
async def create_task(
    user_id: str,
    task_in: TaskCreate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized create attempt to user {user_id} by {current_user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: access denied"
        )
    logger.info(f"Creating task for user: {current_user_id}")
    db_task = Task.model_validate(task_in.model_dump() | {"user_id": user_id})
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    logger.info(f"Created task {db_task.id} for user {user_id}")
    return db_task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: UUID = Path(..., title="Task ID"),
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized get attempt to user {user_id}/task {task_id} by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user_id:
        logger.warning(f"Task {task_id} not found or unauthorized for user {current_user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info(f"Retrieved task {task_id} for user {current_user_id}")
    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: UUID = Path(..., title="Task ID"),
    task_in: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized update attempt to user {user_id}/task {task_id} by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user_id:
        logger.warning(f"Task {task_id} not found or unauthorized for update by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    logger.info(f"Updated task {task_id} for user {current_user_id}")
    return db_task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: UUID = Path(..., title="Task ID"),
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized delete attempt to user {user_id}/task {task_id} by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user_id:
        logger.warning(f"Task {task_id} not found or unauthorized for delete by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    session.delete(db_task)
    session.commit()
    logger.info(f"Deleted task {task_id} for user {current_user_id}")

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: UUID = Path(..., title="Task ID"),
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        logger.warning(f"Unauthorized toggle attempt to user {user_id}/task {task_id} by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user_id:
        logger.warning(f"Task {task_id} not found or unauthorized for toggle by {current_user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db_task.is_completed = not db_task.is_completed
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    logger.info(f"Toggled completion for task {task_id} (now {db_task.is_completed}) for user {current_user_id}")
    return db_task
