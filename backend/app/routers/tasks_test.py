import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session
from ..main import app
from ..models.task import Task
from ..core.db import engine  # Assume exposed or use test engine

client = TestClient(app)

# Note: Full integration tests require test DB, seeded users/JWTs
# Example usage:

def test_list_tasks():
    # Arrange: valid JWT for user 'user123'
    headers = {"Authorization": "Bearer valid_jwt_user123"}
    response = client.get("/user123/tasks", headers=headers)
    assert response.status_code == 200

def test_create_task():
    headers = {"Authorization": "Bearer valid_jwt_user123"}
    data = {"title": "Test Task", "priority": 2}
    response = client.post("/user123/tasks", json=data, headers=headers)
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"

# Add more: get/update/delete/toggle with valid/invalid JWT, wrong user_id, etc.
