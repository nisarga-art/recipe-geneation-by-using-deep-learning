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

    # JWT Auth
    SECRET_KEY: str = "change-this-to-a-random-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24   # 24 hours

    class Config:
        env_file = ".env"


settings = Settings()
