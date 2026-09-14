from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Incident Resolution Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str
    REDIS_URL: str
    GEMINI_API_KEY: str

    GEMINI_MODEL: str = "gemini-3.5-flash"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()