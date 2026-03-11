from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "analytics-core"
    APP_ENV: str = "dev"
    APP_DEBUG: bool = True
    APP_VERSION: str = "0.1.0"

    API_PREFIX: str = "/analytics"

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db"

    SSE_HEARTBEAT_SECONDS: int = 15
    EXPORT_MAX_POINTS: int = 100_000

    AUTH_ENABLED: bool = False
    ADMIN_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
