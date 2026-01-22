<!--
Sync Impact Report:
- Version change: 3.0.0 -> 3.1.0 (minor update: added frontend implementation allowance for Phase II E2E verification)
- List of modified principles: Added "Frontend Implementation Allowance"
- Added sections: None new; principle added to Core Principles
- Removed sections: None
- Templates requiring updates (✅ updated / ⚠ pending): plan-template.md ✅ (Constitution Check aligns), spec-template.md ✅, tasks-template.md ✅
- Follow-up TODOs: Re-run /sp.analyze post-amendment
-->
# Phase II – Todo Full-Stack Web Application Constitution (Integration & Testing)

## Scope
This constitution governs ONLY the integration verification and testing of the complete system.
This SDD cycle is strictly limited to integration verification and testing.
Frontend UI implementation is permitted as minimal intervention required for full end-to-end (E2E) verification of backend, auth, and database integration.
No new features, schemas, or UI components beyond what's required for E2E testing.

## Core Principles
- State-awareness: always assess current integration state before changes
- Contract fidelity: frontend, backend, auth, and database must honor existing specs
- Minimal intervention: change only what is required to complete integration
- Frontend Implementation Allowance: Implement frontend UI components necessary for E2E verification (e.g., forms to trigger API calls, displays for response validation); justify each addition as essential for testing backend CRUD + auth isolation
- Verifiability: every integration must be testable end-to-end

## Authoritative Sources
- @specs/api/rest-endpoints.md
- @specs/auth/jwt-authentication.md
- @specs/db/schema.md
- @specs/features/task-crud.md
- @specs/integration/full-system.md

## Standards
- All API endpoints require valid JWT token
- Unauthorized requests must return 401
- Task data must be isolated per authenticated user
- Frontend actions must reflect backend state accurately
- No hardcoded user IDs allowed
- JWT tokens are attached and verified on every API request
- Backend correctly identifies user from token
- Database queries are filtered by authenticated user

## Integration Order
1. Database ↔ Backend
2. Authentication ↔ Backend
3. Frontend ↔ Backend
4. Full system (Frontend + Backend + Auth + DB)

## Rules of Operation
- Begin by inspecting current implementation state
- Identify missing, partial, or broken integrations
- Apply integration changes incrementally, one layer at a time
- After each integration step, validate functionality before proceeding

## Testing Standards
- All API endpoints require valid JWT token
- Unauthorized requests must return 401
- Task data must be isolated per authenticated user
- Frontend actions must reflect backend state accurately
- No hardcoded user IDs allowed

## Constraints
- No manual coding by the user
- No schema changes unless required for integration correctness
- No feature expansion beyond existing specs
- All changes must align with referenced specs
- No backend changes unless required for integration
- No database schema changes unless required for integration correctness

## Implementation Boundaries
- Database ↔ Backend integration must establish proper ORM connections
- Authentication ↔ Backend integration must verify JWT tokens correctly
- Frontend ↔ Backend integration must pass JWT tokens in headers
- Full system integration must ensure end-to-end functionality

## Success Criteria
- Frontend successfully authenticates users via Better Auth
- JWT tokens are attached and verified on every API request
- Backend correctly identifies user from token
- Database queries are filtered by authenticated user
- All CRUD operations function end-to-end
- System passes manual integration test without errors

## Non-Goals
- No new feature development
- No UI redesign
- No schema modifications unless required for integration
- No addition of new API endpoints

## Governance
This Constitution supersedes all other technical practices for the Integration & Testing SDD cycle.
1. **Spec Compliance**: Any deviation from authoritative sources requires a spec update first.
2. **Principle Invariants**: Core principles (State-awareness, Contract fidelity, etc.) are hard gates; no changes without version bump.
3. **Amendment Process**: Changes require version bump and rationale in ADR or updated Constitution.
4. **Integration Order**: Follow the prescribed integration sequence to avoid dependency conflicts.
5. **Verification Requirement**: Every integration step must be validated before proceeding to the next layer.

**Version**: 3.1.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-17
