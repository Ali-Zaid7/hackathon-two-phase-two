<!--
Sync Impact Report:
- Version change: 0.0.0 (Template) -> 1.0.0 (Initial Ratification)
- Added Principles: Schema-First Design, Data Integrity, User Isolation, SQLModel Compatibility, Cloud-Native Constraints
- Defined Constraints: Neon Serverless, SQLModel ORM, Better Auth Integration
- Defined Scope: Database Layer focus (Out of scope: API, Frontend)
- Templates Status: ✅ All templates compatible with new principles
-->

# Phase II – Todo Full-Stack Web Application Constitution

## Core Principles

### I. Schema-First Design
Database defines system truth. The schema must align exactly with API and feature specs (specifically `specs/database/schema.md`). No backend or frontend work should proceed until the database schema is validated against the specification.

### II. Data Integrity Over Convenience
Strict enforcement of data validity at the database level. Foreign key constraints must enforce ownership. All timestamps (created_at, updated_at) must be generated or validated server-side/database-side, never trusted blindly from the client.

### III. User Data Isolation (Hard Invariant)
Every task or private resource MUST be owned by exactly one user. This is a non-negotiable security invariant. Tasks cannot exist without a valid `user_id`. Queries must be designed to efficiently filter by `user_id` (creation of appropriate indexes is mandatory).

### IV. SQLModel Compatibility
All database interactions must be defined using SQLModel. No raw SQL should be used for core application logic unless absolutely necessary for performance and documented via ADR. The schema definition must be compatible with SQLModel's class-based definition style.

### V. Cloud-Native Constraints
Design for Neon Serverless PostgreSQL. Avoid long-running transactions or patterns that don't scale in a serverless environment. Indexes must be explicitly defined to support frequent query patterns (filtering by user, sorting by date) to minimize compute usage.

## Constraints & Scope

**Technology Stack:**
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (Python)
- **Authentication Source**: Better Auth (users table treated as external authority)

**Boundaries:**
- No frontend or API logic in this cycle.
- No schema changes outside of approved spec updates.
- **Out of Scope**: API route implementation, JWT verification logic, Frontend state/UI, Data migration tooling.

## Success Criteria & Sources

**Sources of Truth:**
- `specs/database/schema.md`
- `specs/features/task-crud.md`
- `specs/features/authentication.md`

**Success Metrics:**
- Database schema matches specs with no ambiguity.
- Tasks cannot exist without a valid `user_id`.
- Queries can efficiently filter by `user_id`.
- Schema supports all CRUD operations (Create, Read, Update, Delete) without modification.
- Backend can be built on top of this schema without requiring immediate schema changes.

## Governance

This Constitution supersedes all other technical practices for the Database Layer cycle.
1. **Spec Compliance**: Any deviation from `specs/database/schema.md` requires a spec update first.
2. **Schema Invariants**: The "User Data Isolation" principle is a hard gate; no PR shall be merged that obscures or weakens user ownership linkage.
3. **Amendment Process**: Changes to these principles require a version bump and explicit rationale documented in an ADR or updated Constitution.

**Version**: 1.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-16
