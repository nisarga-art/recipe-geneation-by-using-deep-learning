from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models  # ensures all tables are registered before create_all
# Import routes lazily so the app can start even when heavy optional
# dependencies (LLM / vision) are not installed during frontend-only dev.
analyze = recipes = auth = health_plan = None

# Create all DB tables on startup (best-effort). If DB not available locally, continue so
# the API can still start for frontend development without a running Postgres instance.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # don't crash the app on DB connection errors during development
    print(f"Warning: could not initialize database: {e}")

app = FastAPI(
    title="Recipe Generation API",
    description="Deep learning powered recipe detection using Clarifai Food Model",
    version="1.0.0",
)

# Middleware to catch unhandled exceptions and return JSON with traceback for debugging
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback


@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        tb = traceback.format_exc()
        print(tb)
        return JSONResponse(status_code=500, content={"detail": "Internal server error", "error": str(exc), "traceback": tb})

# CORS — allow the React frontend dev server
app.add_middleware(
    CORSMiddleware,
    # Allow common dev origins and any localhost/127.0.0.1 port (e.g., Vite fallback port 5174)
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to import and register routers. If any import fails (missing
# optional dependencies), keep the app running so the frontend can be
# developed without the full ML stack installed.
try:
    from .routes import analyze, recipes, auth, health_plan, train

    app.include_router(auth.router)
    app.include_router(recipes.router)
    app.include_router(analyze.router)
    app.include_router(health_plan.router)
    app.include_router(train.router)
except Exception as e:
    # Log and continue — endpoints that depend on missing modules will
    # return 500s with tracebacks (middleware will surface them).
    print(f"Warning: could not import some routes at startup: {e}")


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Recipe Generation API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
