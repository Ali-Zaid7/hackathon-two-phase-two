---
id: 003
title: Confirm Frontend Constitution v2.0.0
stage: constitution
date: 2026-01-17
surface: agent
model: Sonnet 4.5
feature: todo-frontend
branch: 002-todo-frontend
user: Claude Code
command: /sp.constitution
labels: ["constitution", "frontend", "sdd", "confirmation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---
## Prompt

/sp.constitution

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

## Response snapshot

Confirmed constitution content matches existing .specify/memory/constitution.md at v2.0.0. No changes needed. Sync Impact Report updated with confirmation note. Templates consistent.

## Outcome
- ✅ Impact: Low (confirmation, no code changes)
- 🧪 Tests: N/A
- 📁 Files: Updated constitution.md with confirmation Sync Report
- 🔁 Next prompts: N/A
- 🧠 Reflection: Constitution stable for frontend SDD; ready for feature specs/plans.

## Evaluation notes (flywheel)
- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment: N/A
