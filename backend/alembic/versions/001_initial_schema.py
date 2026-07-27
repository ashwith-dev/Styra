"""Initial schema: profiles, clothing_items, pgvector, RLS

Revision ID: 001
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # pgvector
    op.execute("CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions")

    # profiles
    op.create_table(
        "profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["id"], ["auth.users.id"], ondelete="CASCADE"
        ),
    )

    # item_status enum
    op.execute("CREATE TYPE item_status AS ENUM ('draft', 'completed', 'archived')")

    # clothing_items
    op.create_table(
        "clothing_items",
        sa.Column("id", sa.Uuid(), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("original_image_url", sa.Text(), nullable=False),
        sa.Column("segmented_image_url", sa.Text(), nullable=False),
        sa.Column("thumbnail_url", sa.Text(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM("draft", "completed", "archived", name="item_status"),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("attributes", postgresql.JSONB, server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("raw_pipeline_result", postgresql.JSONB, nullable=True),
        sa.Column("pipeline_metrics", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index("idx_clothing_items_user_id", "clothing_items", ["user_id"])
    op.create_index("idx_clothing_items_status", "clothing_items", ["status"])

    # pgvector column (native vector type — not supported by SA column types)
    op.execute("ALTER TABLE clothing_items ADD COLUMN embedding vector(512)")

    # RLS
    op.execute("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY")

    # updated_at trigger
    op.execute("""
        CREATE OR REPLACE FUNCTION trigger_set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clothing_items
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    """)
    op.execute("""
        CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    """)

    # pgvector match function
    op.execute("""
        CREATE OR REPLACE FUNCTION match_compatible_items(
            query_embedding vector(512),
            compatible_categories text[],
            exclude_id uuid,
            match_count int
        )
        RETURNS TABLE (
            id uuid,
            attributes jsonb,
            thumbnail_url text,
            similarity float
        )
        LANGUAGE SQL STABLE
        AS $$
            SELECT
                ci.id,
                ci.attributes,
                ci.thumbnail_url,
                1 - (ci.embedding <=> query_embedding) AS similarity
            FROM clothing_items ci
            WHERE ci.id != exclude_id
              AND ci.attributes->'category'->>'value' = ANY(compatible_categories)
              AND ci.embedding IS NOT NULL
            ORDER BY ci.embedding <=> query_embedding
            LIMIT match_count;
        $$;
    """)


def downgrade() -> None:
    op.execute("DROP FUNCTION IF EXISTS match_compatible_items")
    op.execute("DROP TRIGGER IF EXISTS set_updated_at ON public.clothing_items")
    op.execute("DROP TRIGGER IF EXISTS set_updated_at ON public.profiles")
    op.execute("DROP FUNCTION IF EXISTS trigger_set_updated_at")
    op.drop_table("clothing_items")
    op.execute("DROP TYPE item_status")
    op.drop_table("profiles")
    op.execute("DROP EXTENSION IF EXISTS vector")
