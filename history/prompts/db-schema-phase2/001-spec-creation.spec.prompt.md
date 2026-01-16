---
id: 001
title: Spec creation for DB Schema Phase II
stage: spec
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: db-schema-phase2
branch: 001-db-schema-phase2
user: User
command: /sp.specify
labels: ["database", "schema", "spec"]
links:
  spec: specs/001-db-schema-phase2/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-db-schema-phase2/spec.md
 - specs/001-db-schema-phase2/checklists/requirements.md
tests:
 - none
---

## Prompt

/sp.specify Database layer for Phase II Todo Full-Stack Web Application

Target audience:
- Backend developers
- Claude Code operating under Spec-Kit Plus
- Hackathon judges reviewing architectural clarity

Focus:
- Relational database design using Neon Serverless PostgreSQL
- Data models required to support Task CRUD and user isolation
- Compatibility with FastAPI + SQLModel

Success criteria:
- Defines complete schema for tasks and users (auth-managed)
- Clearly enforces task ownership per user
- Supports all Basic Level features (CRUD + completion toggle)
- Schema is directly mappable to SQLModel classes
- Indexes included for performance on user-scoped queries
- No ambiguity in field types or constraints

Constraints:
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- Auth users are managed externally by Better Auth
- Use UUID/string user IDs compatible with JWT claims
- Schema must support multi-user isolation
- No database-specific logic outside schema definition
- Format: Markdown, compatible with Spec-Kit conventions

In scope:
- Tables definition (tasks, users reference)
- Primary keys and foreign keys
- Required and optional fields
- Indexes for filtering and lookup
- Timestamps (created_at, updated_at)
- Ownership enforcement at schema level

Not building:
- Frontend UI
- Backend API routes
- Authentication logic
- JWT verification
- Database migrations tooling
- Seed or mock data
- Authorization middleware

Explicitly out of scope:
- Chatbot features
- Analytics or reporting tables
- Notifications or reminders
- Multi-tenant organizations
- Soft deletes or archival strategy

Acceptance signal:
- A backend engineer can implement SQLModel models without guessing
- API layer can reliably filter tasks by authenticated user_id
- Frontend requirements do not influence schema decisions

## Response snapshot

Created feature branch `001-db-schema-phase2` and specification file `specs/001-db-schema-phase2/spec.md`. The spec defines the Tasks schema with user isolation, including user stories for data persistence, isolation, and performance. Validated the spec against the quality checklist.

## Outcome

- ✅ Impact: Established strict database contract for Phase II backend work
- 🧪 Tests: Validated against quality checklist
- 📁 Files: Created spec.md and requirements.md checklist
- 🔁 Next prompts: /sp.plan to design implementation details
- 🧠 Reflection: The prompt was highly specific about constraints (Neon, SQLModel), which allowed for a very targeted specification without need for clarifications.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
