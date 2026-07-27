from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    together_api_key: str = ""
    qwen_model: str = "Qwen/Qwen2.5-VL-3B-Instruct"

    storage_bucket_originals: str = "clothing-originals"
    storage_bucket_segmented: str = "clothing-segmented"
    storage_bucket_thumbnails: str = "clothing-thumbnails"

    cors_origins: str = "*"
    max_image_size_mb: int = 10
    min_image_resolution: int = 500

    log_level: str = "INFO"
    app_version: str = "0.1.0"
    api_prefix: str = ""

    database_url: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
