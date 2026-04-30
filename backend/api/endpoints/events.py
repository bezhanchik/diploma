from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import Event
from app.schemas import EventOut
from app.deps import get_current_admin  # если нужен доступ только для админов

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=List[EventOut])
def list_events(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """Получить список мероприятий с пагинацией и фильтрацией"""
    query = select(Event)
    
    # Фильтрация по статусу (если передан)
    if status_filter:
        query = query.where(Event.status == status_filter)
    
    # Пагинация
    query = query.offset(skip).limit(limit)
    
    events = db.scalars(query).all()
    return events

