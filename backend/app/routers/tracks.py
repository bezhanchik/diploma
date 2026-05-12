from typing import Annotated, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_admin
from app.models import User, Track
from app.schemas import TrackOut

router = APIRouter(prefix="/tracks", tags=["Tracks"])


@router.get("", response_model=list[TrackOut])
def get_tracks(
    db: Annotated[Session, Depends(get_db)],
    event_id: Optional[int] = Query(None),
):
    query = select(Track)
    if event_id:
        query = query.where(Track.event_id == event_id)
    return db.scalars(query).all()


@router.post("", response_model=TrackOut, status_code=status.HTTP_201_CREATED)
def create_track(
    payload: dict,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    track = Track(name=payload["name"], event_id=payload.get("event_id"))
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    from app.models import Challenge
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    db.execute(select(Challenge).where(Challenge.track_id == track_id))
    db.delete(track)
    db.commit()
