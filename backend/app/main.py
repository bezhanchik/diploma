from typing import Annotated, Optional, List  # добавьте List в импорт

from fastapi import Depends, FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User, Event, Track, Challenge, Team, TeamMember
from app.schemas import (
    RegisterIn,
    TokenOut,
    UserOut,
    EventCreate,
    EventUpdate,
    EventOut,
    TrackOut,           # новый
    ChallengeCreate,    # новый
    ChallengeUpdate,    # новый
    ChallengeOut,       # новый
    TeamCreate,
    TeamMemberOut,
    TeamOut,
    TeamUpdate,
    AddTeamMember,
    UserUpdate
)
from app.security import create_access_token, hash_password, verify_password


app = FastAPI(title="HackSpaceEdu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite фронтенд
        "http://127.0.0.1:5173",  # Альтернативный адрес
        "http://localhost:3000",  # React по умолчанию
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

@app.get("/ping/")
def ping():
    return {"ok": True}


@app.get("/")
def root():
    return {"message": "API is running"}


@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterIn,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        existing_user = db.scalar(select(User).where(User.email == payload.email))
        if existing_user:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

        user = User(
            email=payload.email,
            password_hash=hash_password(payload.password),
            first_name=payload.first_name,
            last_name=payload.last_name,
            role=payload.role,  # Теперь можно указать role при регистрации
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,  # Возвращаем role
            "created_at": user.created_at,
        }

    except Exception as e:
        db.rollback()
        print("REGISTER ERROR:", repr(e))
        raise

    
@app.post("/auth/login", response_model=TokenOut)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        print("LOGIN ATTEMPT:", form_data.username)

        user = db.scalar(select(User).where(User.email == form_data.username))
        print("USER FOUND:", user.email if user else None)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print("PASSWORD HASH:", user.password_hash)

        is_valid = verify_password(form_data.password, user.password_hash)
        print("PASSWORD VALID:", is_valid)

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(user.id)
        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        print("LOGIN ERROR:", repr(e))
        raise


@app.get("/auth/me", response_model=UserOut)
def me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@app.get("/auth/admin-check")
def admin_check(
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Проверка, является ли текущий пользователь администратором"""
    return {
        "is_admin": True,
        "email": current_admin.email,
        "role": current_admin.role,
    }


# ==================== EVENTS ENDPOINTS ====================

@app.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = Event(
        title=payload.title,
        status=payload.status,
        start_date=payload.start_date,
        end_date=payload.end_date,
        organization_id=payload.organization_id,
    )

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.get("/events", response_model=list[EventOut])
def get_events(
    db: Annotated[Session, Depends(get_db)],
):
    events = db.scalars(select(Event)).all()
    return events


@app.put("/events/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@app.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")

    db.delete(event)
    db.commit()


# ==================== ADMIN ENDPOINTS ====================

@app.get("/users", response_model=list[UserOut])
def get_all_users(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Получить список всех пользователей (только для админов)"""
    users = db.scalars(select(User)).all()
    return users


@app.post("/users/{user_id}/make-admin", response_model=UserOut)
def make_user_admin(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Сделать пользователя администратором (только для админов)"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Пользователь уже является администратором")
    
    user.role = "admin"
    db.commit()
    db.refresh(user)
    
    return user


@app.post("/users/{user_id}/remove-admin", response_model=UserOut)
def remove_admin_role(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Убрать права администратора у пользователя (только для админов)"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Админ не может убрать права у самого себя
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя убрать права у самого себя")
    
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="Пользователь не является администратором")
    
    user.role = "user"
    db.commit()
    db.refresh(user)
    
    return user


@app.get("/tracks", response_model=list[TrackOut])
def get_tracks(
    db: Annotated[Session, Depends(get_db)],
    event_id: int | None = Query(None, description="Filter by event ID")
):
    """Получить список треков (направлений). Можно фильтровать по мероприятию."""
    query = select(Track)
    if event_id:
        query = query.where(Track.event_id == event_id)
    
    tracks = db.scalars(query).all()
    return tracks


@app.post("/tracks", response_model=TrackOut, status_code=status.HTTP_201_CREATED)
def create_track(
    payload: dict, # Используем dict, если нет строгой схемы TrackCreate, или создай её
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Создать новый трек (только для админов)"""
    track = Track(
        name=payload['name'],
        event_id=payload.get('event_id')
    )
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@app.get("/challenges", response_model=list[ChallengeOut])
def get_challenges(
    db: Annotated[Session, Depends(get_db)],
    track_id: int | None = Query(None, description="Filter by track ID"),
    event_id: int | None = Query(None, description="Filter by event ID via track")
):
    """
    Получить список кейсов (задач).
    Можно фильтровать по треку или по мероприятию (через трек).
    """
    query = select(Challenge)
    
    # Если передан track_id, фильтруем по нему
    if track_id:
        query = query.where(Challenge.track_id == track_id)
        
    # Если передан event_id, нужно сделать join с Track, чтобы найти кейсы этого мероприятия
    elif event_id:
        query = query.join(Track).where(Track.event_id == event_id)
        
    challenges = db.scalars(query).all()
    return challenges


@app.post("/challenges", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: dict, 
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    """Создать новый кейс/задачу (только для админов)"""
    challenge = Challenge(
        title=payload['title'],
        description=payload.get('description'),
        track_id=payload['track_id']
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge



# ==================== TEAMS ENDPOINTS ====================

@app.get("/teams", response_model=list[TeamOut])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    event_id: Optional[int] = None,
):
    """Получить список команд. Можно фильтровать по мероприятию."""
    query = select(Team)
    if event_id:
        query = query.where(Team.event_id == event_id)
    
    teams = db.scalars(query).all()
    return teams


@app.get("/teams/{team_id}", response_model=TeamOut)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить команду по ID."""
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    return team


@app.post("/teams", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Создать новую команду."""
    team = Team(
        name=payload.name,
        event_id=payload.event_id,
        track_id=payload.track_id,
        captain_id=current_user.id,
    )
    
    db.add(team)
    db.commit()
    db.refresh(team)
    
    team_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="captain"
    )
    db.add(team_member)
    db.commit()
    
    return team


@app.put("/teams/{team_id}", response_model=TeamOut)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить информацию о команде (только для капитана или админа)."""
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    
    if current_user.id != team.captain_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    
    db.commit()
    db.refresh(team)
    return team



# ==================== USER PROFILE ENDPOINTS ====================

@app.put("/auth/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить профиль пользователя"""
    current_user.first_name = payload.first_name
    current_user.last_name = payload.last_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@app.get("/users/events-count")
def get_user_events_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить количество мероприятий, в которых участвует пользователь"""
    # Подсчет регистраций пользователя на мероприятия
    from app.models import Registration
    count = db.scalar(
        select(func.count()).select_from(Registration).where(Registration.user_id == current_user.id)
    ) or 0
    return {"count": count}


@app.get("/users/teams-count")
def get_user_teams_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить количество команд, в которых состоит пользователь"""
    count = db.scalar(
        select(func.count()).select_from(TeamMember).where(TeamMember.user_id == current_user.id)
    ) or 0
    return {"count": count}