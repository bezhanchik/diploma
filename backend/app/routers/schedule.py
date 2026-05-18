from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, Team
from app.schemas import ScheduleEventOut

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.get("", response_model=list[ScheduleEventOut])
def get_schedule(db: Session = Depends(get_db)):
    from app.models import EventStatus
    from sqlalchemy.orm import selectinload
    events = db.scalars(
        select(Event)
        .options(selectinload(Event.status_obj))
        .order_by(Event.start_date.nulls_last(), Event.id_event)
    ).all()

    result = []
    for event in events:
        teams_count = db.scalar(
            select(func.count()).select_from(Team).where(Team.id_event == event.id_event)
        ) or 0
        result.append(ScheduleEventOut(
            id=event.id,
            title=event.title,
            status=event.status,
            start_date=event.start_date,
            end_date=event.end_date,
            teams_count=teams_count,
        ))
    return result
