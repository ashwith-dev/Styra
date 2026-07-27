"""Staging table for two-phase analyze → save tokens

Revision ID: 003

Replaces the in-memory pipeline token dict (unbounded, no TTL, lost across
workers) with a DB-backed store. Ephemeral service-role-only table: RLS is
enabled with no policies, so only the service key can read/write it. No FK
to profiles — rows are short-lived and may be created before a profile row
exists for pre-trigger users.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pipeline_staging",
        sa.Column("token", sa.Text(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("attributes", postgresql.JSONB, nullable=True),
        sa.Column("original_image_url", sa.Text(), nullable=False),
        sa.Column("segmented_image_url", sa.Text(), nullable=False),
        sa.Column("thumbnail_url", sa.Text(), nullable=True),
        sa.Column("metrics", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "idx_pipeline_staging_created_at", "pipeline_staging", ["created_at"]
    )
    op.execute(
        "ALTER TABLE public.pipeline_staging ENABLE ROW LEVEL SECURITY"
    )


def downgrade() -> None:
    op.drop_table("pipeline_staging")
