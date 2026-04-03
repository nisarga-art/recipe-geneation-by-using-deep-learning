from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # ensures all tables are registered before create_all
from routes import analyze, recipes, auth, health_plan

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Recipe Generation API",
    description="Deep learning powered recipe detection using Clarifai Food Model",
    version="1.0.0",
)

# CORS — allow the React frontend dev server
app.add_middleware(
    CORSMiddleware,
    # Allow both localhost and 127.0.0.1 variants used by dev servers
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(analyze.router)
app.include_router(health_plan.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Recipe Generation API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
