from sqlmodel import create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

# Echo=True for development to see queries
# Handle Neon SSL connection
if DATABASE_URL and "neon.tech" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=True, connect_args={
        "sslmode": "require",
        "sslcert": None,
        "sslkey": None,
        "sslrootcert": None
    })
else:
    engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
