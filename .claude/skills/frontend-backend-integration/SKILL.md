---
name: "frontend-backend-integration"
description: "Guide developers through integrating the Next.js frontend and FastAPI backend of the Todo Full-Stack Web Application. Produces clear technical documentation with step-by-step instructions, examples, and troubleshooting tips."
version: "1.0.0"
---

# Frontend-Backend Integration Skill

## When to Use This Skill
- User asks to "integrate frontend and backend" for the Todo app
- User wants a technical guide on connecting Next.js to FastAPI with JWT auth
- User requests step-by-step documentation with examples

## Procedure

1. **One-Sentence Summary**: Provide a concise overview of what the integration achieves.
2. **List Prerequisites**:
   - Node.js & npm installed
   - Python 3.10+ installed
   - Docker & Docker Compose (optional but recommended)
   - Existing monorepo with `/frontend` (Next.js) and `/backend` (FastAPI)
   - Environment variables: `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`
3. **Step-by-Step Instructions**:
   - **Step 1**: Start the backend
     ```bash
     cd backend
     uvicorn main:app --reload --port 8000
     ```
     *Explain: Starts FastAPI server in development mode.*
   - **Step 2**: Configure frontend API client
     ```ts
     import { api } from '@/lib/api';
     api.setBaseUrl(process.env.NEXT_PUBLIC_API_URL);
     ```
     *Explain: Sets backend base URL for all API calls.*
   - **Step 3**: Integrate JWT authentication
     - Frontend attaches JWT token to `Authorization` header:
       ```ts
       const token = await auth.getToken();
       api.getTasks({ headers: { Authorization: `Bearer ${token}` } });
       ```
     - Backend middleware verifies token and provides `current_user`
   - **Step 4**: Test basic endpoints
     - Create, fetch, update, delete, and toggle tasks
     - Ensure responses are user-specific
   - **Step 5**: Implement frontend UI components
     - Use `/components` and `/app` folders in Next.js
     - Map API responses to dynamic task lists
   - **Step 6**: Validate multi-user isolation
     - Login as multiple users and ensure each sees only their tasks
4. **Troubleshooting**:
   - **Issue**: API calls return 401 Unauthorized  
     **Solution**: Check JWT token configuration and `BETTER_AUTH_SECRET`
   - **Issue**: Tasks are not filtered per user  
     **Solution**: Ensure backend queries include `current_user.id` filter
   - **Issue**: Frontend cannot reach backend  
     **Solution**: Confirm `NEXT_PUBLIC_API_URL` matches backend port, check CORS settings
5. **Notes**:
   - Keep terminology simple; explain “JWT”, “dependency injection”, and “environment variable” on first mention
   - Provide inline code examples where possible
   - Keep instructions sequential and beginner-friendly

## Output Format
- **Integration Summary**: 1 sentence
- **Prerequisites**: Bullet list
- **Step-by-Step Instructions**: Numbered list with code snippets and explanations
- **Troubleshooting Section**: List of common errors with fixes
- **Additional Notes**: Optional tips and clarifications

## Example

**Input**: "Document frontend-backend integration for Todo Full-Stack App"

**Output**:
- **Integration Summary**: Connects Next.js frontend to FastAPI backend with JWT authentication to enable secure, multi-user task management.
- **Prerequisites**: Node.js, Python, Docker, monorepo structure, environment variables
- **Step-by-Step Instructions**: As outlined in Procedure section
- **Troubleshooting**: Includes 401, task filtering, and connection errors
- **Notes**: Explains JWT, environment variables, and dependency injection
