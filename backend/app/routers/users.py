from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, Team, TeamMember
from app.schemas import UserOut

router = APIRouter(prefix="/users", tags=["Users"])

ROLE_USER = 1       # Участник
ROLE_ADMIN = 5      # Администратор



@router.get("", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    return db.scalars(select(User)).all()


@router.get("/search", response_model=list[UserOut])
def search_users(email: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.scalars(select(User).where(User.email == email)).all()


@router.get("/events-count")
def events_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.scalar(
        select(func.count()).select_from(Team)
        .join(TeamMember, TeamMember.id_team == Team.id_team)
        .where(TeamMember.id_user == current_user.id_user, Team.id_event.isnot(None))
    ) or 0
    return {"count": count}


@router.get("/teams-count")
def teams_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.scalar(
        select(func.count()).select_from(TeamMember)
        .where(TeamMember.id_user == current_user.id_user)
    ) or 0
    return {"count": count}


@router.post("/{user_id}/make-admin", response_model=UserOut)
def make_admin(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.id_role = ROLE_ADMIN
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/remove-admin", response_model=UserOut)
def remove_admin(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id_user == current_user.id_user:
        raise HTTPException(status_code=400, detail="Нельзя снять права у самого себя")
    user.id_role = ROLE_USER
    db.commit()
    db.refresh(user)
    return user
