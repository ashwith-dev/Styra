"""Wear history tracking table.

Revision ID: 007
"""

from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wear_history",
        sa.Column("id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("outfit_id", sa.Uuid(), sa.ForeignKey("generated_outfits.id", ondelete="CASCADE"), nullable=False),
        sa.Column("worn_date", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index("idx_wear_history_user_date", "wear_history", ["user_id", "worn_date"])
    op.create_unique_constraint("uq_wear_history_user_date", "wear_history", ["user_id", "worn_date"])

    op.execute("ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY")

    op.execute("""
        CREATE POLICY "Users can read their own wear history"
        ON public.wear_history
        FOR SELECT
        USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY "Users can insert their own wear history"
        ON public.wear_history
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY "Users can update their own wear history"
        ON public.wear_history
        FOR UPDATE
        USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY "Users can delete their own wear history"
        ON public.wear_history
        FOR DELETE
        USING (auth.uid() = user_id)
    """)


def downgrade() -> None:
    op.drop_table("wear_history")
