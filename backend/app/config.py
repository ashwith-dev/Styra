from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    openrouter_api_key: str = ""
    qwen_model: str = "qwen/qwen2.5-vl-72b-instruct"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    storage_bucket_originals: str = "clothing-originals"
    storage_bucket_segmented: str = "clothing-segmented"
    storage_bucket_thumbnails: str = "clothing-thumbnails"

    cors_origins: str = "*"
    host: str = "0.0.0.0"
    port: int = 8000
    max_image_size_mb: int = 10
    min_image_resolution: int = 500

    log_level: str = "INFO"
    app_version: str = "0.1.0"
    api_prefix: str = ""

    database_url: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}


settings = Settings()
