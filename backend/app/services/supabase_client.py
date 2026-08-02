from supabase import create_client, Client, ClientOptions

from app.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
    """Return the service-role client for admin-only operations (storage, user
    provisioning, pipeline staging).  This client BYPASSES RLS — never use it
    for user-data queries that must respect row-level security."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
            options=ClientOptions(
                postgrest_client_timeout=5,
                storage_client_timeout=5,
            ),
        )
    return _supabase


def get_user_client(jwt_token: str) -> Client:
    """Return a Supabase client whose session is bound to *jwt_token*.

    PostgREST calls made through this client run as the token's subject
    (``auth.uid()``), so RLS policies are enforced.  Use this for all
    user-data queries (clothing_items, profiles, outfit_feedback, etc.).
    """
    client = create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
        options=ClientOptions(
            postgrest_client_timeout=5,
            storage_client_timeout=5,
        ),
    )
    client.postgrest.auth(token=jwt_token)
    return client
