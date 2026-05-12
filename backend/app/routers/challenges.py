from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_admin
from app.models import User, Challenge, Track
from app.schemas import ChallengeOut, ChallengeDetailOut

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.get("/detail/{challenge_id}", response_model=ChallengeDetailOut)
def get_challenge(challenge_id: int, db: Annotated[Session, Depends(get_db)]):
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    track = db.get(Track, challenge.track_id)
    related = db.scalars(
        select(Challenge)
        .where(Challenge.track_id == challenge.track_id, Challenge.id != challenge_id)
        .limit(5)
    ).all()

    return ChallengeDetailOut(
        id=challenge.id,
        title=challenge.title,
        description=challenge.description,
        track_id=challenge.track_id,
        track_name=track.name if track else None,
        related=[ChallengeOut.model_validate(c) for c in related],
    )


@router.get("", response_model=list[ChallengeOut])
def get_challenges(
    db: Annotated[Session, Depends(get_db)],
    track_id: Optional[int] = Query(None),
    event_id: Optional[int] = Query(None),
):
    query = select(Challenge)
    if track_id:
        query = query.where(Challenge.track_id == track_id)
    elif event_id:
        query = query.join(Track).where(Track.event_id == event_id)
    return db.scalars(query).all()


@router.post("", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: dict,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    challenge = Challenge(
        title=payload["title"],
        description=payload.get("description"),
        track_id=payload["track_id"],
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    db.delete(challenge)
    db.commit()
