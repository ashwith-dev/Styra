"""Generated outfit history tables.

Revision ID: 006
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "generated_outfits",
        sa.Column("id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("occasion", sa.Text(), nullable=True),
        sa.Column("style", sa.Text(), nullable=True),
        sa.Column("weather", postgresql.JSONB, nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("gemini_reason", sa.Text(), nullable=True),
        sa.Column("gemini_used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("fallback_used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("request_id", sa.Text(), nullable=True),
        sa.Column("candidate_count", sa.Integer(), nullable=True),
        sa.Column("pipeline_duration_ms", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index("idx_generated_outfits_user_id", "generated_outfits", ["user_id"])
    op.create_index("idx_generated_outfits_created_at", "generated_outfits", ["created_at"])
    op.create_index(
        "idx_generated_outfits_dedup",
        "generated_outfits",
        ["user_id", "occasion", "style", "created_at"],
    )

    op.create_table(
        "generated_outfit_items",
        sa.Column("id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column(
            "outfit_id",
            sa.Uuid(),
            sa.ForeignKey("generated_outfits.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("clothing_item_id", sa.Uuid(), nullable=False),
        sa.Column("slot", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "idx_generated_outfit_items_outfit_id",
        "generated_outfit_items",
        ["outfit_id"],
    )

    op.execute("ALTER TABLE public.generated_outfits ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE public.generated_outfit_items ENABLE ROW LEVEL SECURITY")

    op.execute("""
        CREATE POLICY "Users can read their own generated outfits"
        ON public.generated_outfits
        FOR SELECT
        USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY "Users can insert their own generated outfits"
        ON public.generated_outfits
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)
    """)

    op.execute("""
        CREATE POLICY "Users can read their own generated outfit items"
        ON public.generated_outfit_items
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.generated_outfits
                WHERE generated_outfits.id = generated_outfit_items.outfit_id
                AND generated_outfits.user_id = auth.uid()
            )
        )
    """)
    op.execute("""
        CREATE POLICY "Users can insert their own generated outfit items"
        ON public.generated_outfit_items
        FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.generated_outfits
                WHERE generated_outfits.id = generated_outfit_items.outfit_id
                AND generated_outfits.user_id = auth.uid()
            )
        )
    """)


def downgrade() -> None:
    op.drop_table("generated_outfit_items")
    op.drop_table("generated_outfits")
