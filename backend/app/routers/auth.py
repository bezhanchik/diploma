from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_current_admin
from app.models import User
from app.schemas import RegisterIn, TokenOut, UserOut, UserUpdate
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

ROLE_USER = 1       # Участник
ROLE_ADMIN = 5      # Администратор


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Annotated[Session, Depends(get_db)]):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    id_role = ROLE_ADMIN if payload.role == "admin" else ROLE_USER
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        id_role=id_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.scalar(select(User).where(User.email == form_data.username))
    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.id_user)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.get("/admin-check")
def admin_check(current_admin: Annotated[User, Depends(get_current_admin)]):
    return {"is_admin": True, "email": current_admin.email, "role": current_admin.role}


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    if payload.first_name is not None:
        current_user.first_name = payload.first_name
    if payload.last_name is not None:
        current_user.last_name = payload.last_name
    db.commit()
    db.refresh(current_user)
    return current_user
