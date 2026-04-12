try:
    from redis import Redis
    from rq import Queue, Job
except Exception:
    Redis = None
    Queue = None
    Job = None
from config import settings
from rag_service import build_index_from_recipes, save_index
from database import SessionLocal
from models import Recipe

if Redis is not None and Queue is not None:
    redis_conn = Redis.from_url(settings.REDIS_URL)
    queue = Queue("default", connection=redis_conn)
else:
    redis_conn = None
    queue = None


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
    if queue is None:
        return "queue_unavailable"
    job = queue.enqueue(_reindex_job)
    return job.get_id()


def get_job_status(job_id: str) -> dict:
    if Job is None or redis_conn is None:
        return {"status": "queue_unavailable", "id": job_id}
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        return {"status": "not_found"}

    return {"id": job.get_id(), "status": job.get_status(), "result": job.result}
