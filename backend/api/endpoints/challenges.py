# backend/app/routers/challenges.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Challenge, Track
from app.schemas import ChallengeCreate, ChallengeUpdate, ChallengeOut, DifficultyEnum
from app.deps import get_current_admin

router = APIRouter(prefix="/challenges", tags=["challenges"])

@router.get("/", response_model=List[ChallengeOut])
def get_challenges(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    track_id: Optional[int] = Query(None, ge=1),
    difficulty: Optional[DifficultyEnum] = None,
):
    """Получить список кейсов с пагинацией и фильтрацией"""
    query = select(Challenge)
    
    if track_id:
        query = query.where(Challenge.track_id == track_id)
    
    if difficulty:
        query = query.where(Challenge.difficulty == difficulty)
    
    query = query.offset(skip).limit(limit)
    challenges = db.scalars(query).all()
    return challenges


@router.get("/{challenge_id}", response_model=ChallengeOut)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
):
    """Получить детальную информацию о кейсе"""
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    return challenge


@router.post("/", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """Создать новый кейс (только для админов)"""
    track = db.get(Track, payload.track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    
    challenge = Challenge(
        title=payload.title,
        description=payload.description,
        track_id=payload.track_id,
        difficulty=payload.difficulty,
        points=payload.points,
        company=payload.company,
    )
    
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.put("/{challenge_id}", response_model=ChallengeOut)
def update_challenge(
    challenge_id: int,
    payload: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """Обновить кейс (только для админов)"""
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    
    if payload.track_id is not None:
        track = db.get(Track, payload.track_id)
        if not track:
            raise HTTPException(status_code=404, detail="Трек не найден")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(challenge, field, value)
    
    db.commit()
    db.refresh(challenge)
    return challenge


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """Удалить кейс (только для админов)"""
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    
    db.delete(challenge)
    db.commit()