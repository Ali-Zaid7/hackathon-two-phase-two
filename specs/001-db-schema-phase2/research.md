# Research & Decisions: Database Layer

## 1. User ID Format & Storage
**Decision**: Store `user_id` as `VARCHAR` (String) and treat it as a logical foreign key.
**Rationale**:
- Better Auth (and most modern auth providers like Auth0, Supabase) returns user IDs as strings.
- Storing as String provides maximum compatibility.
- We cannot use a physical `FOREIGN KEY` constraint because the Users table is managed by an external library/service (Better Auth) and might not even be in the same database schema (per strict modularity).
**Alternatives**:
- *UUID type*: Too restrictive if the ID format changes (e.g., to CUID or integer-based).
- *Integer*: Not compatible with typical JWT `sub` claims.

## 2. Task Primary Key Strategy
**Decision**: Use UUID (v4) for `Task.id`.
**Rationale**:
- Globally unique identifiers are safer for distributed systems.
- Prevents enumeration attacks (guessing task IDs: 1, 2, 3...) which is critical for a multi-user system where data privacy is paramount.
- Client-side generation possible if needed (optimistic UI).
**Alternatives**:
- *Auto-increment Integer*: Simpler but exposes volume and order. Harder to merge databases later if needed.

## 3. Database Indexes
**Decision**:
1. Index on `user_id` (Hash or B-Tree).
2. Composite index on `(user_id, created_at)` for sorting.
**Rationale**:
- The most common query will be "Show me MY tasks", i.e., `SELECT * FROM tasks WHERE user_id = ?`.
- Second most common: "Show me my recent tasks", i.e., `ORDER BY created_at DESC`.
**Alternatives**:
- *No index*: Table scan is O(N) and disastrous for multi-tenant performance.

## 4. Timestamps
**Decision**: Use `TIMESTAMP WITH TIME ZONE` (UTC).
**Rationale**:
- Essential for global applications.
- SQLModel/SQLAlchemy `DateTime(timezone=True)` maps to PostgreSQL `TIMESTAMPTZ`.
