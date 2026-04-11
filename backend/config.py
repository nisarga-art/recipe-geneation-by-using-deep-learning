from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # PostgreSQL — update these in your .env file
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/recipe_db"

    # Clarifai
    CLARIFAI_PAT: str = ""           # Personal Access Token from clarifai.com
    CLARIFAI_USER_ID: str = "clarifai"
    CLARIFAI_APP_ID: str = "main"
    CLARIFAI_MODEL_ID: str = "food-item-recognition"
    CLARIFAI_MODEL_VERSION: str = "1d5fd481e0cf4826aa72ec3ff049e044"
    # Clarifai text search (set if you want text queries). Leave blank to disable.
    CLARIFAI_TEXT_MODEL_ID: str = ""
    CLARIFAI_TEXT_MODEL_VERSION: str = ""

    # JWT Auth
    SECRET_KEY: str = "change-this-to-a-random-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24   # 24 hours

    # Flan-T5 model (open-source LLM) settings
    FLAN_MODEL_NAME: str = "google/flan-t5-base"
    FLAN_MAX_TOKENS: int = 512
    FLAN_TEMPERATURE: float = 0.7
    # If you have GPU and want to use it, set FLAN_USE_CUDA=true in .env
    FLAN_USE_CUDA: bool = False
    # Redis for background jobs (RQ)
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"


settings = Settings()
