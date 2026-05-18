from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, Event, EventStatus, Track, Team
from app.schemas import EventCreate, EventUpdate, EventOut, EventDetailOut, TrackWithChallengesOut, ChallengeOut, TeamBriefOut, UserOut

router = APIRouter(prefix="/events", tags=["Events"])


def _resolve_status(db: Session, status_name: Optional[str]) -> Optional[int]:
    if not status_name:
        return None
    row = db.scalar(select(EventStatus).where(EventStatus.name == status_name))
    if row:
        return row.id_status
    new_status = EventStatus(name=status_name)
    db.add(new_status)
    db.flush()
    return new_status.id_status


@router.get("", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.scalars(select(Event).options(selectinload(Event.status_obj))).all()
    return events


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.scalar(
        select(Event)
        .options(
            selectinload(Event.status_obj),
            selectinload(Event.tracks).selectinload(Track.cases),
            selectinload(Event.teams).selectinload(Team.members),
        )
        .where(Event.id_event == event_id)
    )
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")

    tracks_out = [
        TrackWithChallengesOut(
            id=t.id,
            name=t.name,
            challenges=[ChallengeOut(id=c.id, title=c.title, description=c.description, track_id=c.track_id) for c in t.cases],
        )
        for t in event.tracks
    ]

    teams_out = [
        TeamBriefOut(
            id=team.id,
            name=team.name,
            captain=None,
            members_count=len(team.members),
        )
        for team in event.teams
    ]

    return EventDetailOut(
        id=event.id,
        title=event.title,
        status=event.status,
        start_date=event.start_date,
        end_date=event.end_date,
        organizer_name=event.organizer_name,
        tracks=tracks_out,
        teams=teams_out,
        teams_count=len(event.teams),
        challenges_count=sum(len(t.cases) for t in event.tracks),
    )


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    event = Event(
        name=payload.title,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status_id=_resolve_status(db, payload.status),
        organizer_name=getattr(payload, 'organizer_name', None),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    if payload.title is not None:
        event.name = payload.title
    if payload.status is not None:
        event.status_id = _resolve_status(db, payload.status)
    if payload.start_date is not None:
        event.start_date = payload.start_date
    if payload.end_date is not None:
        event.end_date = payload.end_date
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    db.delete(event)
    db.commit()
