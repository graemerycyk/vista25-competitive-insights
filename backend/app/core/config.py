from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: List[str]
    SUPABASE_URL: str
    SUPABASE_KEY: str
    OPENAI_API_KEY: str


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
