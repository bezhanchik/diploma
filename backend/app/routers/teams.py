from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import User, Team, TeamMember
from app.schemas import TeamCreate, TeamUpdate, TeamOut, AddTeamMember

router = APIRouter(prefix="/teams", tags=["Teams"])

ROLE_CAPTAIN = 1
ROLE_MEMBER = 2


def _load_team(db: Session, team_id: int) -> Team:
    team = db.scalar(
        select(Team)
        .options(
            selectinload(Team.members).selectinload(TeamMember.user),
            selectinload(Team.members).selectinload(TeamMember.role_obj),
        )
        .where(Team.id_team == team_id)
    )
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    return team


def _assert_captain_or_admin(team: Team, current_user: User) -> None:
    if current_user.role == "admin":
        return
    if team.captain_id != current_user.id:
        raise HTTPException(status_code=403, detail="Только капитан или администратор")


@router.get("", response_model=list[TeamOut])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    event_id: Optional[int] = None,
):
    query = select(Team).options(
        selectinload(Team.members).selectinload(TeamMember.user),
        selectinload(Team.members).selectinload(TeamMember.role_obj),
    )
    if event_id:
        query = query.where(Team.id_event == event_id)
    return db.scalars(query).all()


@router.get("/{team_id}", response_model=TeamOut)
def get_team(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _load_team(db, team_id)


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = Team(
        name=payload.name,
        id_event=payload.event_id,
        id_track=payload.track_id,
        creation_date=date.today(),
        status_id=1,
    )
    db.add(team)
    db.flush()

    db.add(TeamMember(id_team=team.id_team, id_user=current_user.id_user, id_team_role=ROLE_CAPTAIN))
    db.commit()
    return _load_team(db, team.id_team)


@router.put("/{team_id}", response_model=TeamOut)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = _load_team(db, team_id)
    _assert_captain_or_admin(team, current_user)
    if payload.name is not None:
        team.name = payload.name
    if payload.event_id is not None:
        team.id_event = payload.event_id
    if payload.track_id is not None:
        team.id_track = payload.track_id
    db.commit()
    return _load_team(db, team_id)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = _load_team(db, team_id)
    _assert_captain_or_admin(team, current_user)
    for member in list(team.members):
        db.delete(member)
    db.delete(team)
    db.commit()


@router.post("/{team_id}/members", response_model=TeamOut)
def add_team_member(
    team_id: int,
    payload: AddTeamMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = _load_team(db, team_id)
    _assert_captain_or_admin(team, current_user)

    existing = db.scalar(
        select(TeamMember).where(TeamMember.id_team == team_id, TeamMember.id_user == payload.user_id)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже в команде")

    id_team_role = ROLE_CAPTAIN if payload.role == "captain" else ROLE_MEMBER
    db.add(TeamMember(id_team=team_id, id_user=payload.user_id, id_team_role=id_team_role))
    db.commit()
    return _load_team(db, team_id)


@router.delete("/{team_id}/members/{user_id}", response_model=TeamOut)
def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = _load_team(db, team_id)
    _assert_captain_or_admin(team, current_user)
    if user_id == team.captain_id:
        raise HTTPException(status_code=400, detail="Нельзя удалить капитана из команды")

    member = db.scalar(
        select(TeamMember).where(TeamMember.id_team == team_id, TeamMember.id_user == user_id)
    )
    if not member:
        raise HTTPException(status_code=404, detail="Участник не найден")
    db.delete(member)
    db.commit()
    return _load_team(db, team_id)
