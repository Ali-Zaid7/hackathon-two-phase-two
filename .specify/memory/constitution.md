<!--
Sync Impact Report:
- Version change: 1.0.0 -> 2.0.0 (MAJOR bump due to scope shift from database/backend to frontend SDD; new principles supersede prior database invariants)
- Modified Principles: Replaced database-focused (Schema-First, Data Integrity, User Isolation, SQLModel, Cloud-Native) with frontend-focused (Spec-first, Contract fidelity, Stateless UI, Progressive enhancement)
- Added Sections: Scope, Core principles, Authoritative sources, Standards, Constraints, Implementation boundaries, Success criteria, Non-goals
- Removed Sections: Database-specific Constraints & Scope, Success Metrics
- Templates Status: ✅ plan-template.md, spec-template.md, tasks-template.md compatible (no hard references to constitution content)
- Follow-up TODOs: None
-->

# Phase II – Todo Full-Stack Web Application Constitution (Frontend SDD)

## Scope
This constitution governs ONLY the frontend implementation.
Backend, database schema, and authentication are already implemented and considered stable.

## Core Principles
- Spec-first development (frontend must follow specs, not invent behavior)
- Contract fidelity (frontend must not assume backend behavior beyond API specs)
- Stateless UI logic (no business rules duplicated from backend)
- Progressive enhancement (works before polish)

## Authoritative Sources
- @specs/ui/components.md
- @specs/ui/pages.md
- @specs/api/rest-endpoints.md
- @specs/features/task-crud.md
- frontend/CLAUDE.md

## Standards
- Next.js App Router (server components by default)
- Client components only for interactivity
- All API calls go through `/lib/api.ts`
- JWT token must be attached to every request
- No direct fetch calls inside components
- No hardcoded user IDs (user derived from JWT session)

## Constraints
- No backend changes allowed
- No database schema changes allowed
- No authentication logic implemented on frontend (Better Auth already configured)
- No manual coding outside Claude Code
- UI must be responsive (mobile + desktop)

## Implementation Boundaries
- Frontend consumes backend as a black box
- Frontend trusts backend for authorization and filtering
- Frontend handles loading, empty, and error states only

## Success Criteria
- User can sign in and see only their own tasks
- All CRUD operations work end-to-end via API
- JWT is attached to every request
- UI reflects backend truth (no optimistic lies)
- No spec violations detected during review

## Non-Goals
- No chatbot features
- No advanced filters beyond spec
- No UI redesign beyond defined components

## Governance
This Constitution supersedes all other technical practices for the Frontend SDD cycle.
1. **Spec Compliance**: Any deviation from authoritative sources requires a spec update first.
2. **Principle Invariants**: Core principles (Spec-first, Contract fidelity, etc.) are hard gates; no changes without version bump.
3. **Amendment Process**: Changes require version bump and rationale in ADR or updated Constitution.

**Version**: 2.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-17