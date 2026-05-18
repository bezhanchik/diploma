from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, events, teams, users, tracks, challenges, schedule, analytics, projects

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="HackSpaceEdu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(teams.router)
app.include_router(users.router)
app.include_router(tracks.router)
app.include_router(challenges.router)
app.include_router(schedule.router)
app.include_router(analytics.router)
app.include_router(projects.router)


@app.get("/ping/")
def ping():
    return {"ok": True}


@app.get("/")
def root():
    return {"message": "API is running"}
