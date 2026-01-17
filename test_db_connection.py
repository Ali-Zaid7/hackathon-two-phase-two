import os
from sqlmodel import create_engine, text, SQLModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("❌ Error: DATABASE_URL not found in environment variables")
    exit(1)

# Ensure the driver is correct for SQLModel/SQLAlchemy
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")

print(f"Connecting to: {database_url.split('@')[1] if '@' in database_url else 'DATABASE'}")

try:
    # Create engine
    engine = create_engine(database_url, echo=False)

    # Test connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Success! Database returned:", result.scalar())

        # Check database version
        version = connection.execute(text("SELECT version()"))
        print(f"PostgreSQL Version: {version.scalar()}")

except Exception as e:
    print(f"Connection failed: {e}")
    exit(1)
