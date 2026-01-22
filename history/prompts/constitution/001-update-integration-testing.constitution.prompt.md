---
id: 001
title: "Update Integration Testing Constitution"
stage: constitution
date_iso: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: "none"
branch: "003-todo-frontend"
user: "user"
command: "/sp.constitution"
labels: ["constitution", "integration", "testing"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - .specify/memory/constitution.md
tests_yaml: |
  - "None - Documentation update only"
outcome: "Updated constitution from frontend-focused to integration & testing-focused"
evaluation: "Constitution successfully updated to reflect integration & testing phase requirements"
---

# Prompt Text

```
/sp.constitution

Project: Phase II – Todo Full-Stack Web Application (Integration & Testing)

Scope:
This SDD cycle is strictly limited to integration verification and testing.
No new features, schemas, or UI components may be introduced.

Core principles:
- State-awareness: always assess current integration state before changes
- Contract fidelity: frontend, backend, auth, and database must honor existing specs
- Minimal intervention: change only what is required to complete integration
- Verifiability: every integration must be testable end-to-end

Integration order:
1. Database ↔ Backend
2. Authentication ↔ Backend
3. Frontend ↔ Backend
4. Full system (Frontend + Backend + Auth + DB)

Rules of operation:
- Begin by inspecting current implementation state
- Identify missing, partial, or broken integrations
- Apply integration changes incrementally, one layer at a time
- After each integration step, validate functionality before proceeding

Testing standards:
- All API endpoints require valid JWT token
- Unauthorized requests must return 401
- Task data must be isolated per authenticated user
- Frontend actions must reflect backend state accurately
- No hardcoded user IDs allowed

Constraints:
- No manual coding by the user
- No schema changes unless required for integration correctness
- No feature expansion beyond existing specs
- All changes must align with referenced specs

Success criteria:
- Frontend successfully authenticates users via Better Auth
- JWT tokens are attached and verified on every API request
- Backend correctly identifies user from token
- Database queries are filtered by authenticated user
- All CRUD operations function end-to-end
- System passes manual integration test without errors
```

# Response Text

Updated the project constitution to reflect the integration & testing phase requirements. The constitution was transformed from a frontend-focused document to one that governs the complete system integration and testing process. Key changes include:

- Updated scope to focus on integration verification and testing
- Revised core principles to emphasize state-awareness, contract fidelity, minimal intervention, and verifiability
- Added specific integration order requirements
- Defined testing standards for JWT authentication and user data isolation
- Established clear constraints for the integration phase
- Updated success criteria to encompass full system functionality
- Modified governance section to reflect the new integration-focused approach

The version was bumped from 2.0.0 to 3.0.0 to indicate a major change in focus from frontend development to full system integration.