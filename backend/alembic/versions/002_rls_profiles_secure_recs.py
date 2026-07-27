"""Security fixes: user-scoped recommendations, RLS policies, profile bootstrap

Revision ID: 002

- match_compatible_items previously searched across ALL users' items; it now
  takes p_user_id and only matches within the caller's wardrobe.
- RLS was enabled on profiles/clothing_items with no policies, denying all
  anon/authenticated access; add per-user policies.
- clothing_items.user_id references profiles.id but nothing populated
  profiles; add an auth.users trigger so every new signup gets a profile row.
"""
from alembic import op

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. User-scoped recommendation function (old signature dropped so no
    #    unfiltered overload survives)
    op.execute(
        "DROP FUNCTION IF EXISTS match_compatible_items(vector, text[], uuid, integer)"
    )
    op.execute("""
        CREATE FUNCTION match_compatible_items(
            p_user_id uuid,
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
            WHERE ci.user_id = p_user_id
              AND ci.id != exclude_id
              AND ci.attributes->'category'->>'value' = ANY(compatible_categories)
              AND ci.embedding IS NOT NULL
            ORDER BY ci.embedding <=> query_embedding
            LIMIT match_count;
        $$;
    """)

    # 2. RLS policies (tables already have RLS enabled from 001)
    op.execute("""
        CREATE POLICY profiles_select_own ON public.profiles
            FOR SELECT USING (auth.uid() = id)
    """)
    op.execute("""
        CREATE POLICY profiles_update_own ON public.profiles
            FOR UPDATE USING (auth.uid() = id)
    """)
    op.execute("""
        CREATE POLICY clothing_items_select_own ON public.clothing_items
            FOR SELECT USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY clothing_items_insert_own ON public.clothing_items
            FOR INSERT WITH CHECK (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY clothing_items_update_own ON public.clothing_items
            FOR UPDATE USING (auth.uid() = user_id)
    """)
    op.execute("""
        CREATE POLICY clothing_items_delete_own ON public.clothing_items
            FOR DELETE USING (auth.uid() = user_id)
    """)

    # 3. Auto-create a profile row for every new auth user
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id) VALUES (NEW.id)
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
    """)
    op.execute("""
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user")

    for policy, table in [
        ("profiles_select_own", "profiles"),
        ("profiles_update_own", "profiles"),
        ("clothing_items_select_own", "clothing_items"),
        ("clothing_items_insert_own", "clothing_items"),
        ("clothing_items_update_own", "clothing_items"),
        ("clothing_items_delete_own", "clothing_items"),
    ]:
        op.execute(f"DROP POLICY IF EXISTS {policy} ON public.{table}")

    op.execute(
        "DROP FUNCTION IF EXISTS match_compatible_items(uuid, vector, text[], uuid, integer)"
    )
    op.execute("""
        CREATE FUNCTION match_compatible_items(
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
