---
name: "todo-auth-authorization"
description: "Guide developers through implementing JWT-based authentication and authorization for the Todo Full-Stack Web Application backend. Provides clear, step-by-step instructions, code examples, and troubleshooting advice."
version: "1.0.0"
---

# Todo App Authorization Skill

## When to Use This Skill

- User asks how to implement authentication and authorization in the Todo App
- User needs guidance on verifying JWT tokens from Better Auth
- User wants to enforce per-user access control in FastAPI backend

## Summary

This skill helps developers securely implement authentication and authorization for the Todo Full-Stack Web Application using JWT tokens issued by Better Auth, ensuring each user can only access their own tasks.

## Prerequisites

- Python 3.10+ and FastAPI installed
- SQLModel models for `users` and `tasks` already defined
- Better Auth frontend configured to issue JWT tokens
- `BETTER_AUTH_SECRET` environment variable set in backend
- Basic understanding of HTTP headers and JSON

## Procedure

1. **Install dependencies**
```bash
pip install fastapi python-jose[cryptography] pydantic
