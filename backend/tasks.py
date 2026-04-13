from typing import Optional, Dict
from .config import settings
from .rag_service import build_index_from_recipes, save_index
from .database import SessionLocal
from .models import Recipe


def _get_queue():
    """Lazily create an RQ Queue to avoid import-time issues on environments
    without Redis/RQ installed (e.g., frontend-only dev on Windows).
    Returns a `Queue` instance or `None` if unavailable.
    """
    try:
        from redis import Redis
        from rq import Queue
    except Exception:
        return None
    conn = Redis.from_url(settings.REDIS_URL)
    return Queue("default", connection=conn)


def _reindex_job():
    """Background worker job: build FAISS index from DB recipes and save to disk."""
    db = SessionLocal()
    try:
        recipes = db.query(Recipe).all()
        recipe_dicts = []
        for r in recipes:
            recipe_dicts.append({"id": r.id, "title": r.title, "ingredients": r.ingredients, "image": r.image if hasattr(r, "image") else None})

        build_index_from_recipes(recipe_dicts)
        save_index("backend/faiss_index.bin", "backend/faiss_meta.json")
        return {"status": "ok", "count": len(recipe_dicts)}
    finally:
        db.close()


def enqueue_reindex() -> str:
    """Enqueue the reindex job. Returns a job id string or the string
    "queue_unavailable" if RQ/Redis are not installed/configured.
    """
    q = _get_queue()
    if q is None:
        return "queue_unavailable"
    job = q.enqueue(_reindex_job)
    return job.get_id()


def get_job_status(job_id: str) -> Dict:
    """Return a small status dict for the given job id.
    If RQ/Redis are not available, returns `{"status": "queue_unavailable"}`.
    If the job cannot be found, returns `{"status": "not_found"}`.
    """
    try:
        from redis import Redis
        from rq import Job
    except Exception:
        return {"status": "queue_unavailable", "id": job_id}

    try:
        conn = Redis.from_url(settings.REDIS_URL)
        job = Job.fetch(job_id, connection=conn)
    except Exception:
        return {"status": "not_found", "id": job_id}

    return {"id": job.get_id(), "status": job.get_status(), "result": job.result}
