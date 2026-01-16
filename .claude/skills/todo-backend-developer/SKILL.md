---
name: "todo-backend-developer"
description: "Guide a developer to implement backend REST API endpoints, business logic, and per-user data isolation for the Todo Full-Stack Web Application using Python FastAPI. Use this skill when user wants to build secure, spec-compliant backend routes or services."
version: "1.0.0"
---

# Todo Backend Developer Skill

## When to Use This Skill

- User asks to "implement backend logic" or "create REST API endpoints"
- User wants secure per-user task operations
- User wants examples in Python FastAPI with SQLModel
- User needs guidance on authentication integration with JWT

## Procedure

1. **Start with a one-sentence summary**  
   - Summarize the backend endpoint or service purpose clearly.  
   - Example: "Implement the endpoint to create a new task for an authenticated user."

2. **List prerequisites**  
   - Python 3.11+ installed  
   - FastAPI framework installed (`pip install fastapi uvicorn`)  
   - SQLModel ORM installed (`pip install sqlmodel`)  
   - Database models imported (e.g., `User`, `Task`)  
   - JWT authentication dependency ready (`get_current_user`)  

3. **Provide step-by-step instructions with code examples**  
   - Use minimal jargon; explain terms on first use  
   - Example format:
     ```python
     from fastapi import APIRouter, Depends, HTTPException
     from sqlmodel import Session
     from models import Task
     from auth.dependencies import get_current_user

     router = APIRouter()

     @router.post("/api/tasks")
     async def create_task(title: str, description: str = None, current_user=Depends(get_current_user)):
         """
         Create a new task for the authenticated user.
         """
         if not title:
             raise HTTPException(status_code=422, detail="Title is required")
         task = Task(title=title, description=description, user_id=current_user.id)
         with Session() as session:
             session.add(task)
             session.commit()
             session.refresh(task)
         return task
     ```
   - Include user isolation in every query  
   - Show examples for CRUD: Create, Read, Update, Delete, Toggle Complete  

4. **End with a troubleshooting section**  
   - Common issues:
     - Missing `current_user` → 401 Unauthorized  
     - Incorrect user_id filtering → data leaks between users  
     - SQLModel session not committed → changes not saved  
     - FastAPI validation errors → check Pydantic types  
   - Include brief suggestions for each  

## Output Format

- **Summary**: 1 sentence describing the backend endpoint/service  
- **Prerequisites**: List of dependencies/tools  
- **Instructions**: Step-by-step guide with code examples  
- **Troubleshooting**: Common issues and fixes  

## Quality Criteria

- Code: PEP8-compliant, secure, and readable  
- User Isolation: STRICT, enforced on every query  
- Endpoints: Match the `/specs/api/rest-endpoints.md` exactly  
- Authentication: Use `get_current_user()` dependency  
- Error Handling: Proper HTTP status codes with meaningful messages  

## Example

**Input**: "Create backend logic for the endpoint POST /api/tasks"

**Output**:
- **Summary**: "Implement the endpoint to create a new task for an authenticated user."
- **Prerequisites**:
  - Python 3.11+
  - FastAPI, SQLModel installed
  - User and Task models imported
  - `get_current_user` JWT dependency available
- **Instructions**: Step-by-step Python FastAPI code example (as shown above)  
- **Troubleshooting**:
  - 401 Unauthorized → check `get_current_user` injection
  - Task not saved → ensure `session.commit()` is called
  - Wrong tasks returned → filter queries by `current_user.id`
