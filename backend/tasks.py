from .config import settings
from .rag_service import build_index_from_recipes, save_index
from .database import SessionLocal
from .models import Recipe


def _get_queue():
    """Lazily create rq Queue to avoid import-time issues on Windows."""
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
            recipe_dicts.append({"id": r.id, "title": r.title, "ingredients": r.ingredients})

        build_index_from_recipes(recipe_dicts)
        save_index("backend/faiss_index.bin", "backend/faiss_meta.json")
        return {"status": "ok", "count": len(recipe_dicts)}
    finally:
        db.close()


def enqueue_reindex():
    q = _get_queue()
    if q is None:
        raise RuntimeError("RQ or Redis not available in this environment")
    job = q.enqueue(_reindex_job)
    return job.get_id()


def get_job_status(job_id: str) -> dict:
    try:
        from rq import Job
        from redis import Redis
        conn = Redis.from_url(settings.REDIS_URL)
        job = Job.fetch(job_id, connection=conn)
    except Exception:
        return {"status": "not_found"}

    return {"id": job.get_id(), "status": job.get_status(), "result": job.result}
