from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Todo Full-Stack Web Application API",
    description="Phase II Backend API for multi-user task management",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers.tasks import router as tasks_router

app.include_router(tasks_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
