---
name: "todo-app-tester"
description: "Test and document the frontend and backend capabilities of the Todo Full-Stack Web Application (Phase II). This skill verifies that the application meets technical requirements, including API endpoints, authentication, database integration, and responsive UI behavior."
version: "1.0.0"
---

# Todo App Testing Skill

## When to Use This Skill

- User wants to validate that the Todo Full-Stack Web Application meets Phase II functional and technical requirements
- User wants step-by-step guidance for testing REST API endpoints, authentication flows, frontend UI, and database interactions
- User wants clear technical documentation for testing results

## Procedure

1. **Summary**  
   Provide a one-sentence overview of what will be tested: frontend, backend, and authentication flows.

2. **Prerequisites**  
   - Local or deployed app running with frontend (Next.js) and backend (FastAPI) connected to Neon PostgreSQL
   - Environment variables configured (BETTER_AUTH_SECRET, DATABASE_URL)
   - Access to API spec files (`/specs/api/rest-endpoints.md`)
   - Postman, curl, or similar API testing tools installed
   - Node.js, Python, and database client tools available

3. **Step-by-Step Instructions with Code Examples**

   ### Backend API Testing
   - Test **CRUD endpoints** for tasks:
     ```bash
     # List tasks
     curl -H "Authorization: Bearer <token>" http://localhost:8000/api/<user_id>/tasks
     
     # Create a task
     curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
     -d '{"title": "Test Task", "description": "Check backend functionality"}' \
     http://localhost:8000/api/<user_id>/tasks
     
     # Update a task
     curl -X PUT -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
     -d '{"title": "Updated Task"}' \
     http://localhost:8000/api/<user_id>/tasks/<task_id>
     
     # Delete a task
     curl -X DELETE -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/<user_id>/tasks/<task_id>
     
     # Toggle completion
     curl -X PATCH -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/<user_id>/tasks/<task_id>/complete
     ```

   - Verify **user isolation**: a user should not see or modify tasks belonging to another user.

   ### Authentication Testing
   - Sign in via frontend using Better Auth
   - Confirm JWT is issued and stored
   - Use JWT in API requests and verify 401 Unauthorized for invalid/missing tokens

   ### Frontend Testing
   - Verify **responsive UI** on different devices
   - Confirm that task creation, updates, completion toggles, and deletions reflect correctly
   - Test **API error handling**: simulate backend errors and check frontend messages
   - Validate proper rendering of task lists filtered by user

4. **Troubleshooting**
   - **401 Unauthorized**: Check `BETTER_AUTH_SECRET` matches frontend and backend
   - **404 Not Found**: Confirm task ID exists and belongs to current user
   - **CORS errors**: Ensure frontend origin is allowed in backend CORS configuration
   - **Database errors**: Verify Neon PostgreSQL connection string and that SQLModel models match the schema
   - **Frontend not updating**: Check API request headers include JWT and frontend dev server is running

## Output Format

- **Test Summary**: 1-2 sentence overview of success/failure
- **Backend Test Results**: Table of endpoint, request, expected response, actual response
- **Authentication Test Results**: Success/failure of JWT issuance and verification
- **Frontend Test Results**: Screenshots or observations of UI behavior and task operations
- **Issues / Notes**: List of any bugs, errors, or unexpected behaviors
