#!/usr/bin/env python
"""Script to create database tables for the Todo application."""

import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel
from backend.app.models.task import Task

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in environment variables")
    exit(1)

# Handle Neon SSL connection
if "neon.tech" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={
        "sslmode": "require",
        "sslcert": None,
        "sslkey": None,
        "sslrootcert": None
    })
else:
    engine = create_engine(DATABASE_URL)

print("Creating database tables...")

# Create all tables
try:
    SQLModel.metadata.create_all(engine)
    print("[SUCCESS] Tables created successfully!")
    print("- tasks table")
except Exception as e:
    print(f"[ERROR] Error creating tables: {e}")
    exit(1)