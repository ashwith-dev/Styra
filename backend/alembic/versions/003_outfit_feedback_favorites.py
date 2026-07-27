"""Outfit feedback and favorites tables

Revision ID: 003
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
        "outfit_feedback",
        sa.Column(
            "id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True
        ),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("outfit_id", sa.Text(), nullable=False),
        sa.Column(
            "feedback", postgresql.ENUM("like", "dislike", name="feedback_type"), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index("idx_outfit_feedback_user", "outfit_feedback", ["user_id"])
    op.create_index(
        "idx_outfit_feedback_user_outfit",
        "outfit_feedback",
        ["user_id", "outfit_id"],
        unique=True,
    )

    # RLS
    op.execute("ALTER TABLE public.outfit_feedback ENABLE ROW LEVEL SECURITY")
    op.execute("""
        CREATE POLICY outfit_feedback_select_own ON public.outfit_feedback
            FOR SELECT USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY outfit_feedback_insert_own ON public.outfit_feedback
            FOR INSERT WITH CHECK (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY outfit_feedback_update_own ON public.outfit_feedback
            FOR UPDATE USING (auth.uid() = user_id)
    """)

    op.create_table(
        "outfit_favorites",
        sa.Column(
            "id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True
        ),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("outfit_id", sa.Text(), nullable=False),
        sa.Column("outfit_data", postgresql.JSONB, server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index("idx_outfit_favorites_user", "outfit_favorites", ["user_id"])
    op.create_index(
        "idx_outfit_favorites_user_outfit",
        "outfit_favorites",
        ["user_id", "outfit_id"],
        unique=True,
    )

    op.execute("ALTER TABLE public.outfit_favorites ENABLE ROW LEVEL SECURITY")
    op.execute("""
        CREATE POLICY outfit_favorites_select_own ON public.outfit_favorites
            FOR SELECT USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY outfit_favorites_insert_own ON public.outfit_favorites
            FOR INSERT WITH CHECK (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY outfit_favorites_delete_own ON public.outfit_favorites
            FOR DELETE USING (auth.uid() = user_id)
    """)


def downgrade() -> None:
    for policy, table in [
        ("outfit_feedback_select_own", "outfit_feedback"),
        ("outfit_feedback_insert_own", "outfit_feedback"),
        ("outfit_feedback_update_own", "outfit_feedback"),
        ("outfit_favorites_select_own", "outfit_favorites"),
        ("outfit_favorites_insert_own", "outfit_favorites"),
        ("outfit_favorites_delete_own", "outfit_favorites"),
    ]:
        op.execute(f"DROP POLICY IF EXISTS {policy} ON public.{table}")

    op.drop_table("outfit_favorites")
    op.drop_table("outfit_feedback")
    op.execute("DROP TYPE IF EXISTS feedback_type")
