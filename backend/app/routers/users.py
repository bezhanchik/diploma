from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, TeamMember, Registration
from app.schemas import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserOut])
def get_all_users(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return db.scalars(select(User)).all()


@router.post("/{user_id}/make-admin", response_model=UserOut)
def make_user_admin(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Пользователь уже является администратором")
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/remove-admin", response_model=UserOut)
def remove_admin_role(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя убрать права у самого себя")
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="Пользователь не является администратором")
    user.role = "user"
    db.commit()
    db.refresh(user)
    return user


@router.get("/search", response_model=list[UserOut])
def search_users(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Поиск пользователя по точному email — доступно любому авторизованному пользователю."""
    users = db.scalars(select(User).where(User.email == email)).all()
    return users


@router.get("/events-count")
def get_user_events_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.scalar(
        select(func.count()).select_from(Registration).where(Registration.user_id == current_user.id)
    ) or 0
    return {"count": count}


@router.get("/teams-count")
def get_user_teams_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.scalar(
        select(func.count()).select_from(TeamMember).where(TeamMember.user_id == current_user.id)
    ) or 0
    return {"count": count}
