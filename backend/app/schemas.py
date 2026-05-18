from datetime import date, datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, EmailStr, Field


# ─── Auth / User ───────────────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    role: Optional[Literal["user", "admin"]] = "user"


class UserOut(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Events ────────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class EventOut(BaseModel):
    id: int
    title: str
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    organizer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Tracks ────────────────────────────────────────────────────────────────────

class TrackCreate(BaseModel):
    name: str
    event_id: Optional[int] = None


class TrackOut(BaseModel):
    id: int
    name: str
    event_id: Optional[int] = None

    class Config:
        from_attributes = True


# ─── Cases (Challenges) ────────────────────────────────────────────────────────

class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    track_id: int = Field(..., ge=1)


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    track_id: Optional[int] = Field(None, ge=1)


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    track_id: int

    class Config:
        from_attributes = True


# ─── Teams ─────────────────────────────────────────────────────────────────────

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


# ─── Detail views ──────────────────────────────────────────────────────────────

class TrackWithChallengesOut(BaseModel):
    id: int
    name: str
    challenges: List[ChallengeOut] = []

    class Config:
        from_attributes = True


class TeamBriefOut(BaseModel):
    id: int
    name: str
    captain: Optional[UserOut] = None
    members_count: int = 0


class EventDetailOut(BaseModel):
    id: int
    title: str
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    organizer_name: Optional[str] = None
    tracks: List[TrackWithChallengesOut] = []
    teams: List[TeamBriefOut] = []
    teams_count: int = 0
    challenges_count: int = 0

    class Config:
        from_attributes = True


class ChallengeDetailOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    track_id: int
    track_name: Optional[str] = None
    related: List[ChallengeOut] = []


# ─── Schedule ──────────────────────────────────────────────────────────────────

class ScheduleEventOut(BaseModel):
    id: int
    title: str
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    teams_count: int = 0

    class Config:
        from_attributes = True


# ─── Analytics ─────────────────────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    users_count: int
    events_count: int
    teams_count: int
    challenges_count: int


class EventStatusStat(BaseModel):
    status: str
    count: int


class TopEventOut(BaseModel):
    id: int
    title: str
    status: Optional[str] = None
    teams_count: int


# ─── Projects / Solutions ──────────────────────────────────────────────────────

class SubmissionOut(BaseModel):
    id: int
    version: int
    repository_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    team_id: Optional[int] = None
    challenge_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    submissions: List[SubmissionOut] = []

    class Config:
        from_attributes = True
