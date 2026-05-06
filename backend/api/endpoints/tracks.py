# backend/app/routers/tracks.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Track, Challenge
from app.schemas import TrackOut
from app.deps import get_current_admin

router = APIRouter(prefix="/tracks", tags=["tracks"])

@router.get("/", response_model=List[TrackOut])
def get_tracks(
    db: Session = Depends(get_db),
):
    """Получить список всех треков"""
    tracks = db.scalars(select(Track)).all()
    return tracks


@router.post("/", response_model=TrackOut, status_code=status.HTTP_201_CREATED)
def create_track(
    name: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """Создать новый трек (только для админов)"""
    existing = db.scalar(select(Track).where(Track.name == name))
    if existing:
        raise HTTPException(status_code=400, detail="Трек с таким названием уже существует")
    
    track = Track(name=name)
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """Удалить трек (только для админов)"""
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    
    challenges_count = db.scalar(select(func.count()).where(Challenge.track_id == track_id))
    if challenges_count and challenges_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Нельзя удалить трек, к которому привязаны {challenges_count} кейсов"
        )
    
    db.delete(track)
    db.commit()