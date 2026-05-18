from datetime import datetime
from pathlib import Path
from uuid import uuid4
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import ProjectSolution, Team, TeamMember, User
from app.schemas import ProjectOut, SubmissionOut

UPLOAD_DIR = Path("/app/uploads")
ALLOWED_EXTENSIONS = {".zip", ".pdf", ".tar", ".gz", ".rar", ".7z", ".docx", ".pptx"}

router = APIRouter(prefix="/projects", tags=["Projects"])


def _assert_team_member(db: Session, team_id: int, current_user: User) -> None:
    if current_user.role == "admin":
        return
    member = db.scalar(
        select(TeamMember).where(
            TeamMember.id_team == team_id,
            TeamMember.id_user == current_user.id_user,
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="Вы не состоите в этой команде")


def _solution_to_project(solutions: List[ProjectSolution]) -> List[ProjectOut]:
    """Group solutions by (id_team, id_case) and return ProjectOut list."""
    groups: dict = {}
    for s in solutions:
        key = (s.id_team, s.id_case)
        if key not in groups:
            groups[key] = []
        groups[key].append(s)

    result = []
    for (team_id, case_id), sols in groups.items():
        sols_sorted = sorted(sols, key=lambda x: x.id_solution)
        submissions = [
            SubmissionOut(
                id=sol.id_solution,
                version=i + 1,
                repository_url=sol.repo_url or sol.presentation_file,
                created_at=sol.upload_date,
            )
            for i, sol in enumerate(sols_sorted)
        ]
        result.append(ProjectOut(
            id=sols_sorted[0].id_solution,
            team_id=team_id,
            challenge_id=case_id,
            title=sols_sorted[-1].title,
            description=sols_sorted[-1].description,
            submissions=list(reversed(submissions)),
        ))
    return result


@router.get("/team/{team_id}", response_model=List[ProjectOut])
def get_team_projects(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_team_member(db, team_id, current_user)
    solutions = db.scalars(
        select(ProjectSolution).where(ProjectSolution.id_team == team_id)
    ).all()
    return _solution_to_project(solutions)


@router.post("/submit", response_model=ProjectOut)
async def submit_solution(
    team_id: int = Form(...),
    challenge_id: int = Form(...),
    project_title: str = Form(...),
    project_description: str = Form(None),
    repository_url: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_team_member(db, team_id, current_user)

    if not repository_url and (not file or not file.filename):
        raise HTTPException(status_code=400, detail="Укажите ссылку или загрузите файл")

    final_url = repository_url
    presentation_file = None

    if file and file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Недопустимый тип файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}",
            )
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid4().hex}{ext}"
        (UPLOAD_DIR / filename).write_bytes(await file.read())
        presentation_file = f"/uploads/{filename}"

    solution = ProjectSolution(
        id_team=team_id,
        id_case=challenge_id,
        title=project_title.strip(),
        description=project_description.strip() if project_description else None,
        repo_url=final_url,
        presentation_file=presentation_file,
        upload_date=datetime.now(),
    )
    db.add(solution)
    db.commit()

    all_solutions = db.scalars(
        select(ProjectSolution).where(
            ProjectSolution.id_team == team_id,
            ProjectSolution.id_case == challenge_id,
        )
    ).all()
    projects = _solution_to_project(all_solutions)
    return projects[0]
