from supabase import create_client, Client, ClientOptions

from app.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
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
