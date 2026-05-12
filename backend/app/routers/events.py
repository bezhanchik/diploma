from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_admin
from app.models import User, Event, Track, Challenge, Team, TeamMember
from app.schemas import (
    EventCreate, EventUpdate, EventOut, EventDetailOut,
    TrackWithChallengesOut, TeamBriefOut, ChallengeOut, UserOut,
)

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=list[EventOut])
def get_events(db: Annotated[Session, Depends(get_db)]):
    return db.scalars(select(Event)).all()


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: int, db: Annotated[Session, Depends(get_db)]):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")

    tracks = db.scalars(select(Track).where(Track.event_id == event_id)).all()
    tracks_out = []
    total_challenges = 0
    for track in tracks:
        challenges = db.scalars(select(Challenge).where(Challenge.track_id == track.id)).all()
        total_challenges += len(challenges)
        tracks_out.append(TrackWithChallengesOut(
            id=track.id,
            name=track.name,
            challenges=[ChallengeOut.model_validate(c) for c in challenges],
        ))

    teams = db.scalars(select(Team).where(Team.event_id == event_id)).all()
    teams_out = []
    for team in teams:
        members_count = db.scalar(
            select(func.count()).select_from(TeamMember).where(TeamMember.team_id == team.id)
        ) or 0
        teams_out.append(TeamBriefOut(
            id=team.id,
            name=team.name,
            captain=UserOut.model_validate(team.captain) if team.captain else None,
            members_count=members_count,
        ))

    return EventDetailOut(
        id=event.id,
        title=event.title,
        status=event.status,
        start_date=event.start_date,
        end_date=event.end_date,
        organization_id=event.organization_id,
        tracks=tracks_out,
        teams=teams_out,
        teams_count=len(teams_out),
        challenges_count=total_challenges,
    )


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = Event(
        title=payload.title,
        status=payload.status,
        start_date=payload.start_date,
        end_date=payload.end_date,
        organization_id=payload.organization_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    db.delete(event)
    db.commit()
