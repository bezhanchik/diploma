from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, CaseTask, Track
from app.schemas import ChallengeCreate, ChallengeUpdate, ChallengeOut, ChallengeDetailOut

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.get("", response_model=list[ChallengeOut])
def get_challenges(
    track_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(CaseTask)
    if track_id:
        query = query.where(CaseTask.id_track == track_id)
    return db.scalars(query).all()


@router.get("/detail/{challenge_id}", response_model=ChallengeDetailOut)
def get_challenge_detail(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.get(CaseTask, challenge_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")

    related = db.scalars(
        select(CaseTask)
        .where(CaseTask.id_track == case.id_track, CaseTask.id_case != challenge_id)
        .limit(5)
    ).all()

    track = db.get(Track, case.id_track)

    return ChallengeDetailOut(
        id=case.id,
        title=case.title,
        description=case.description,
        track_id=case.track_id,
        track_name=track.name if track else None,
        related=[ChallengeOut(id=r.id, title=r.title, description=r.description, track_id=r.track_id) for r in related],
    )


@router.post("", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    # id_partner required in DB — use 1 as default (create a default partner if needed)
    _ensure_default_partner(db)
    case = CaseTask(
        name=payload.title,
        description=payload.description,
        id_track=payload.track_id,
        id_partner=1,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.put("/{challenge_id}", response_model=ChallengeOut)
def update_challenge(
    challenge_id: int,
    payload: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    case = db.get(CaseTask, challenge_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    if payload.title is not None:
        case.name = payload.title
    if payload.description is not None:
        case.description = payload.description
    if payload.track_id is not None:
        case.id_track = payload.track_id
    db.commit()
    db.refresh(case)
    return case


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    case = db.get(CaseTask, challenge_id)
    if not case:
        raise HTTPException(status_code=404, detail="Кейс не найден")
    db.delete(case)
    db.commit()


def _ensure_default_partner(db: Session) -> None:
    from app.models import Partner
    from sqlalchemy import select
    if not db.scalar(select(Partner).where(Partner.id_partner == 1)):
        db.add(Partner(id_partner=1, name="Организатор"))
        db.flush()
