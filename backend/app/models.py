from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ─── Справочники ───────────────────────────────────────────────────────────────

class InstitutionType(Base):
    __tablename__ = "institution_type"
    id_institution_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class Institution(Base):
    __tablename__ = "institution"
    id_institution: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    id_type: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("institution_type.id_institution_type"), nullable=True)
    institution_type = relationship("InstitutionType")


class UserRole(Base):
    __tablename__ = "user_role"
    id_role: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class EventType(Base):
    __tablename__ = "event_type"
    id_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class EventStatus(Base):
    __tablename__ = "event_status"
    id_status: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class EventFormat(Base):
    __tablename__ = "event_format"
    id_format: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class TeamRole(Base):
    __tablename__ = "team_role"
    id_role: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class TeamStatus(Base):
    __tablename__ = "team_status"
    id_status: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class Partner(Base):
    __tablename__ = "partner"
    id_partner: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)


class MaterialType(Base):
    __tablename__ = "material_type"
    id_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    type_name: Mapped[str] = mapped_column(String, nullable=False)


class VenueType(Base):
    __tablename__ = "venue_type"
    id_venue_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    type_name: Mapped[str] = mapped_column(String, nullable=False)


class StageCategory(Base):
    __tablename__ = "stage_category"
    id_category: Mapped[int] = mapped_column(Integer, primary_key=True)
    category_name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Criterion(Base):
    __tablename__ = "criterion"
    id_criterion: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)


# ─── Пользователи ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id_user: Mapped[int] = mapped_column(Integer, primary_key=True)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    id_role: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("user_role.id_role"), nullable=True)
    id_institution: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("institution.id_institution"), nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    role_obj = relationship("UserRole")
    institution = relationship("Institution")

    # ── Алиасы для совместимости с роутерами ──
    @property
    def id(self) -> int:
        return self.id_user

    @property
    def role(self) -> str:
        # 5 = Администратор
        return "admin" if self.id_role == 5 else "user"

    @property
    def created_at(self) -> Optional[datetime]:
        return None


# ─── Мероприятия ───────────────────────────────────────────────────────────────

class Event(Base):
    __tablename__ = "event"

    id_event: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    event_type_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("event_type.id_type"), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("event_status.id_status"), nullable=True)
    format_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("event_format.id_format"), nullable=True)
    organizer_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    event_type = relationship("EventType")
    status_obj = relationship("EventStatus")
    format_obj = relationship("EventFormat")
    teams = relationship("Team", back_populates="event")
    tracks = relationship("Track", back_populates="event")
    materials = relationship("EventMaterial", back_populates="event")
    schedule_items = relationship("Schedule", back_populates="event")
    event_criteria = relationship("EventCriterion", back_populates="event")

    # ── Алиасы ──
    @property
    def id(self) -> int:
        return self.id_event

    @property
    def title(self) -> str:
        return self.name

    @property
    def status(self) -> Optional[str]:
        return self.status_obj.name if self.status_obj else None


# ─── Треки и кейсы ─────────────────────────────────────────────────────────────

class Track(Base):
    __tablename__ = "track"

    id_track: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_event: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    event = relationship("Event", back_populates="tracks")
    cases = relationship("CaseTask", back_populates="track")

    @property
    def id(self) -> int:
        return self.id_track

    @property
    def event_id(self) -> Optional[int]:
        return self.id_event

    # Алиас для совместимости с кодом который обращается к track.challenges
    @property
    def challenges(self):
        return self.cases


class CaseTask(Base):
    __tablename__ = "case_task"

    id_case: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_track: Mapped[int] = mapped_column(Integer, ForeignKey("track.id_track"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    id_partner: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("partner.id_partner"), nullable=True)

    track = relationship("Track", back_populates="cases")
    partner = relationship("Partner")

    @property
    def id(self) -> int:
        return self.id_case

    @property
    def title(self) -> str:
        return self.name

    @property
    def track_id(self) -> int:
        return self.id_track


# ─── Команды ───────────────────────────────────────────────────────────────────

class Team(Base):
    __tablename__ = "team"

    id_team: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    id_event: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=True)
    id_institution: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("institution.id_institution"), nullable=True)
    creation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("team_status.id_status"), nullable=True)
    mentor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id_user"), nullable=True)
    id_track: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("track.id_track"), nullable=True)

    event = relationship("Event", back_populates="teams")
    track = relationship("Track")
    mentor = relationship("User", foreign_keys=[mentor_id])
    members = relationship("TeamMember", back_populates="team")
    status_obj = relationship("TeamStatus")
    cases = relationship("TeamCase", back_populates="team")
    solutions = relationship("ProjectSolution", back_populates="team")

    @property
    def id(self) -> int:
        return self.id_team

    @property
    def event_id(self) -> Optional[int]:
        return self.id_event

    @property
    def track_id(self) -> Optional[int]:
        return self.id_track

    @property
    def captain_id(self) -> Optional[int]:
        for m in self.members:
            if m.id_team_role == 1:  # 1 = captain
                return m.id_user
        return None

    @property
    def captain(self) -> Optional[User]:
        for m in self.members:
            if m.id_team_role == 1:
                return m.user
        return None


class TeamMember(Base):
    __tablename__ = "team_member"

    id_tm: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_team: Mapped[int] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=False)
    id_user: Mapped[int] = mapped_column(Integer, ForeignKey("users.id_user"), nullable=False)
    id_team_role: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("team_role.id_role"), nullable=True)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    team = relationship("Team", back_populates="members")
    user = relationship("User")
    role_obj = relationship("TeamRole")

    @property
    def user_id(self) -> int:
        return self.id_user

    @property
    def team_id(self) -> int:
        return self.id_team

    @property
    def role(self) -> str:
        return self.role_obj.name if self.role_obj else "member"


class TeamCase(Base):
    __tablename__ = "team_case"
    id_tc: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_team: Mapped[int] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=False)
    id_case: Mapped[int] = mapped_column(Integer, ForeignKey("case_task.id_case"), nullable=False)

    team = relationship("Team", back_populates="cases")
    case = relationship("CaseTask")


# ─── Решения команд ────────────────────────────────────────────────────────────

class ProjectSolution(Base):
    __tablename__ = "project_solution"

    id_solution: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_team: Mapped[int] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=False)
    upload_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    repo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    presentation_file: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    team = relationship("Team", back_populates="solutions")

    @property
    def id(self) -> int:
        return self.id_solution

    @property
    def repository_url(self) -> Optional[str]:
        return self.repo_url or self.presentation_file

    @property
    def created_at(self) -> Optional[datetime]:
        return self.upload_date


# ─── Оценки ────────────────────────────────────────────────────────────────────

class EventCriterion(Base):
    __tablename__ = "event_criterion"
    id_ec: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_event: Mapped[int] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=False)
    id_criterion: Mapped[int] = mapped_column(Integer, ForeignKey("criterion.id_criterion"), nullable=False)
    weight: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)

    event = relationship("Event", back_populates="event_criteria")
    criterion = relationship("Criterion")


class Evaluation(Base):
    __tablename__ = "evaluation"
    id_evaluation: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_solution: Mapped[int] = mapped_column(Integer, ForeignKey("project_solution.id_solution"), nullable=False)
    id_expert: Mapped[int] = mapped_column(Integer, ForeignKey("users.id_user"), nullable=False)
    id_criterion: Mapped[int] = mapped_column(Integer, ForeignKey("criterion.id_criterion"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evaluation_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    solution = relationship("ProjectSolution")
    expert = relationship("User")
    criterion = relationship("Criterion")


class Result(Base):
    __tablename__ = "result"
    id_result: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_event: Mapped[int] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=False)
    id_team: Mapped[int] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=False)
    total_score: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    overall_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    id_track: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("track.id_track"), nullable=True)
    track_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    event = relationship("Event")
    team = relationship("Team")
    track = relationship("Track")


# ─── Расписание ────────────────────────────────────────────────────────────────

class Venue(Base):
    __tablename__ = "venue"
    id_venue: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    id_venue_type: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("venue_type.id_venue_type"), nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    venue_type = relationship("VenueType")


class Stage(Base):
    __tablename__ = "stage"
    id_stage: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    id_category: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("stage_category.id_category"), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category = relationship("StageCategory")


class Schedule(Base):
    __tablename__ = "schedule"
    id_schedule: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_event: Mapped[int] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=False)
    id_team: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=True)
    id_stage: Mapped[int] = mapped_column(Integer, ForeignKey("stage.id_stage"), nullable=False)
    id_venue: Mapped[int] = mapped_column(Integer, ForeignKey("venue.id_venue"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    event = relationship("Event", back_populates="schedule_items")
    team = relationship("Team")
    stage = relationship("Stage")
    venue = relationship("Venue")


# ─── Материалы ─────────────────────────────────────────────────────────────────

class EventMaterial(Base):
    __tablename__ = "event_material"
    id_material: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_event: Mapped[int] = mapped_column(Integer, ForeignKey("event.id_event"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    id_material_type: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("material_type.id_type"), nullable=True)
    link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    event = relationship("Event", back_populates="materials")
    material_type = relationship("MaterialType")


# ─── Консультации ──────────────────────────────────────────────────────────────

class ConsultationFormat(Base):
    __tablename__ = "consultation_format"
    id_format: Mapped[int] = mapped_column(Integer, primary_key=True)
    format_name: Mapped[str] = mapped_column(String, nullable=False)


class Consultation(Base):
    __tablename__ = "consultation"
    id_consultation: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_team: Mapped[int] = mapped_column(Integer, ForeignKey("team.id_team"), nullable=False)
    id_mentor: Mapped[int] = mapped_column(Integer, ForeignKey("users.id_user"), nullable=False)
    consultation_date: Mapped[date] = mapped_column(Date, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    format_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("consultation_format.id_format"), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    team = relationship("Team")
    mentor = relationship("User")
    format_obj = relationship("ConsultationFormat")
