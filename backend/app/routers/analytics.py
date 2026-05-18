from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_admin
from app.models import User, Event, Team, CaseTask
from app.schemas import AnalyticsSummary, EventStatusStat, TopEventOut

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    return AnalyticsSummary(
        users_count=db.scalar(select(func.count()).select_from(User)) or 0,
        events_count=db.scalar(select(func.count()).select_from(Event)) or 0,
        teams_count=db.scalar(select(func.count()).select_from(Team)) or 0,
        challenges_count=db.scalar(select(func.count()).select_from(CaseTask)) or 0,
    )


@router.get("/by-status", response_model=list[EventStatusStat])
def by_status(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    from app.models import EventStatus
    rows = db.execute(
        select(EventStatus.name, func.count(Event.id_event))
        .outerjoin(Event, Event.status_id == EventStatus.id_status)
        .group_by(EventStatus.name)
    ).all()
    return [EventStatusStat(status=r[0], count=r[1]) for r in rows]


@router.get("/top-events", response_model=list[TopEventOut])
def top_events(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    from app.models import EventStatus
    rows = db.execute(
        select(Event.id_event, Event.name, EventStatus.name, func.count(Team.id_team).label("tc"))
        .outerjoin(EventStatus, Event.status_id == EventStatus.id_status)
        .outerjoin(Team, Team.id_event == Event.id_event)
        .group_by(Event.id_event, Event.name, EventStatus.name)
        .order_by(func.count(Team.id_team).desc())
        .limit(5)
    ).all()
    return [TopEventOut(id=r[0], title=r[1], status=r[2], teams_count=r[3]) for r in rows]
