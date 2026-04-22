from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User, Event
from app.schemas import (
    RegisterIn,
    TokenOut,
    UserOut,
    EventCreate,
    EventUpdate,
    EventOut,
)
from app.security import create_access_token, hash_password, verify_password
from app.deps import get_current_user, get_current_admin

app = FastAPI(title="HackSpaceEdu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
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
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
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


@app.get("/auth/admin-check")
def admin_check(
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return {"is_admin": True}