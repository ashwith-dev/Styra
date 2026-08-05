"""Upgrade embedding dimension from 512 to 1024 for BGE-M3.

Revision ID: 005
"""

from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "UPDATE clothing_items SET embedding = NULL "
        "WHERE embedding IS NOT NULL"
    )
    op.execute("ALTER TABLE clothing_items ALTER COLUMN embedding TYPE vector(1024)")

    op.execute("DROP FUNCTION IF EXISTS match_compatible_items")
    op.execute("""
        CREATE OR REPLACE FUNCTION match_compatible_items(
            query_embedding vector(1024),
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
    op.execute(
        "UPDATE clothing_items SET embedding = NULL "
        "WHERE embedding IS NOT NULL"
    )
    op.execute("ALTER TABLE clothing_items ALTER COLUMN embedding TYPE vector(512)")

    op.execute("DROP FUNCTION IF EXISTS match_compatible_items")
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
