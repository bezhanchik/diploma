from datetime import datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, EmailStr, Field
import enum



# User Schemas
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[Literal["user", "admin"]] = "user"  # По умолчанию "user"


class UserOut(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str  # Добавили role в ответ
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Event Schemas
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
    id: int
    title: str
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization_id: Optional[int] = None

    class Config:
        from_attributes = True


# Organization Schemas (если нужны)
class OrganizationOut(BaseModel):
    id: int
    name: str
    type: str
    domain: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True




class DifficultyEnum(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class TrackOut(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    track_id: int = Field(..., ge=1)


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    track_id: Optional[int] = Field(None, ge=1)


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    track_id: int

    
    class Config:
        from_attributes = True




# Team Schemas
class TeamMemberOut(BaseModel):
    user_id: int
    user: Optional[UserOut] = None
    role: Optional[str] = None
    
    class Config:
        from_attributes = True

class TeamOut(BaseModel):
    id: int
    name: str
    event_id: Optional[int] = None
    track_id: Optional[int] = None
    captain_id: Optional[int] = None
    captain: Optional[UserOut] = None
    members: Optional[List[TeamMemberOut]] = []
    
    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    event_id: Optional[int] = None
    track_id: Optional[int] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    event_id: Optional[int] = None
    track_id: Optional[int] = None

class AddTeamMember(BaseModel):
    user_id: int
    role: Optional[str] = "member"