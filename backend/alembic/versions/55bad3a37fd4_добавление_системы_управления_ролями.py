"""Добавление системы управления ролями

Revision ID: 55bad3a37fd4
Revises: 
Create Date: 2026-05-04 14:41:36.653128

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '55bad3a37fd4'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем колонку role с дефолтным значением "user"
    op.add_column('users', sa.Column('role', sa.Text(), server_default='user', nullable=False))
    
 
 
def downgrade() -> None:
    # Удаляем колонку role при откате миграции
    op.drop_column('users', 'role')