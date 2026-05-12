from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User, Team, TeamMember
from app.schemas import TeamCreate, TeamUpdate, TeamOut, AddTeamMember

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("", response_model=list[TeamOut])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    event_id: Optional[int] = None,
):
    query = select(Team)
    if event_id:
        query = query.where(Team.event_id == event_id)
    return db.scalars(query).all()


@router.get("/{team_id}", response_model=TeamOut)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    return team


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = Team(
        name=payload.name,
        event_id=payload.event_id,
        track_id=payload.track_id,
        captain_id=current_user.id,
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    db.add(TeamMember(team_id=team.id, user_id=current_user.id, role="captain"))
    db.commit()
    return team


@router.put("/{team_id}", response_model=TeamOut)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    if current_user.id != team.captain_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    return team


@router.post("/{team_id}/members", response_model=TeamOut)
def add_team_member(
    team_id: int,
    payload: AddTeamMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    if current_user.id != team.captain_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Только капитан может добавлять участников")

    existing = db.scalar(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == payload.user_id)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже в команде")

    db.add(TeamMember(team_id=team_id, user_id=payload.user_id, role=payload.role))
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}/members/{user_id}", response_model=TeamOut)
def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    if current_user.id != team.captain_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Только капитан может удалять участников")
    if user_id == team.captain_id:
        raise HTTPException(status_code=400, detail="Нельзя удалить капитана из команды")

    member = db.scalar(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
    )
    if not member:
        raise HTTPException(status_code=404, detail="Участник не найден")

    db.delete(member)
    db.commit()
    db.refresh(team)
    return team
