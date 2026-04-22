from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EventCreate(BaseModel):
    title: str
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization_id: Optional[int] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization_id: Optional[int] = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization_id: Optional[int] = None