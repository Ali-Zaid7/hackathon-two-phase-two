---
id: 002
title: update-constitution-frontend-v2
stage: constitution
date: 2026-01-17
surface: agent
model: Sonnet 4.5
feature: none
branch: 001-backend-task-api
user: User
command: /sp.constitution
labels: ["constitution", "frontend", "phase2", "sdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

## User Input

```text
Project: Phase II – Todo Full-Stack Web Application (Frontend SDD)

Scope:
This constitution governs ONLY the frontend implementation.
Backend, database schema, and authentication are already implemented and considered stable.

Core principles:
- Spec-first development (frontend must follow specs, not invent behavior)
- Contract fidelity (frontend must not assume backend behavior beyond API specs)
- Stateless UI logic (no business rules duplicated from backend)
- Progressive enhancement (works before polish)

Authoritative sources:
- @specs/ui/components.md
- @specs/ui/pages.md
- @specs/api/rest-endpoints.md
- @specs/features/task-crud.md
- frontend/CLAUDE.md

Standards:
- Next.js App Router (server components by default)
- Client components only for interactivity
- All API calls go through `/lib/api.ts`
- JWT token must be attached to every request
- No direct fetch calls inside components
- No hardcoded user IDs (user derived from JWT session)

Constraints:
- No backend changes allowed
- No database schema changes allowed
- No authentication logic implemented on frontend (Better Auth already configured)
- No manual coding outside Claude Code
- UI must be responsive (mobile + desktop)

Implementation boundaries:
- Frontend consumes backend as a black box
- Frontend trusts backend for authorization and filtering
- Frontend handles loading, empty, and error states only

Success criteria:
- User can sign in and see only their own tasks
- All CRUD operations work end-to-end via API
- JWT is attached to every request
- UI reflects backend truth (no optimistic lies)
- No spec violations detected during review

Non-goals:
- No chatbot features
- No advanced filters beyond spec
- No UI redesign beyond defined components
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

[Full outline text from the skill prompt... truncated for brevity in this response snapshot]

## Response snapshot

Updated project constitution to v2.0.0 focusing on Frontend SDD. MAJOR version bump due to scope shift from database to frontend principles. Added Sync Impact Report, structured sections, and Governance metadata. No template updates needed. PHR created at history/prompts/constitution/002-update-constitution-frontend-v2.constitution.prompt.md.

## Outcome
- ✅ Impact: Updated constitution to frontend scope (v2.0.0), superseding database v1.0.0
- 🧪 Tests: None required for documentation
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: /sp.specify for frontend features, /sp.plan for architecture
- 🧠 Reflection: Successfully shifted constitution scope; all validations passed, no unresolved placeholders

## Evaluation notes (flywheel)
- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - YAML valid, no placeholders, correct routing
- Prompt variant (if applicable): null
- Next experiment: Proceed to frontend spec/plan generation