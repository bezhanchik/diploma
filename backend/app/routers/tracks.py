from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, Track
from app.schemas import TrackCreate, TrackOut

router = APIRouter(prefix="/tracks", tags=["Tracks"])


@router.get("", response_model=list[TrackOut])
def get_tracks(
    event_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Track)
    if event_id:
        query = query.where(Track.id_event == event_id)
    return db.scalars(query).all()


@router.post("", response_model=TrackOut, status_code=status.HTTP_201_CREATED)
def create_track(
    payload: TrackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    track = Track(name=payload.name, id_event=payload.event_id)
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    db.delete(track)
    db.commit()
