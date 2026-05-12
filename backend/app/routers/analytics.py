from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Event, Team, Challenge
from app.schemas import AnalyticsSummary, EventStatusStat, TopEventOut

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    return AnalyticsSummary(
        users_count=db.scalar(select(func.count()).select_from(User)) or 0,
        events_count=db.scalar(select(func.count()).select_from(Event)) or 0,
        teams_count=db.scalar(select(func.count()).select_from(Team)) or 0,
        challenges_count=db.scalar(select(func.count()).select_from(Challenge)) or 0,
    )


@router.get("/events-by-status", response_model=list[EventStatusStat])
def get_events_by_status(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Event.status, func.count(Event.id).label("count")).group_by(Event.status)
    ).all()
    return [EventStatusStat(status=row.status or "unknown", count=row.count) for row in rows]


@router.get("/top-events", response_model=list[TopEventOut])
def get_top_events(db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            Event.id,
            Event.title,
            Event.status,
            func.count(Team.id).label("teams_count"),
        )
        .outerjoin(Team, Team.event_id == Event.id)
        .group_by(Event.id, Event.title, Event.status)
        .order_by(func.count(Team.id).desc())
        .limit(5)
    ).all()
    return [
        TopEventOut(id=row.id, title=row.title, status=row.status, teams_count=row.teams_count)
        for row in rows
    ]
