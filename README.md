# Recipe Generation by Deep Learning

Lightweight local-first project that detects food from an uploaded image, retrieves similar recipes (RAG + FAISS), and generates a full recipe using an open-source LLM (Flan-T5). Designed to run locally or in Docker.

**Key components**
- FastAPI backend (`backend/`) — image upload, analysis, recipe generation, DB storage.
- CV fallback: BLIP captioning (transformers) + keyword extraction (local, free) when Clarifai not configured.
- LLM: Flan-T5 (Hugging Face transformers) — instruction-tuned open-source generator.
- RAG: `sentence-transformers` + FAISS for retrieval of similar recipes.
- Database: PostgreSQL (configurable via `DATABASE_URL`).
- Background jobs: Redis + RQ for async FAISS reindexing.

--

## Architecture

```mermaid
flowchart LR
  subgraph Frontend
    A[User Upload Image]
  end

  subgraph Backend
    direction TB
    B1[FastAPI / Analyze Endpoint]
    B2[clarifai_service (BLIP|Clarifai)]
    B3[RAG Search (FAISS)]
    B4[LLM Service (Flan-T5)]
    B5[Postgres (recipes table)]
    B6[Redis + RQ Worker]
  end

  A --> B1
  B1 --> B2
  B2 --> B1
  B1 --> B3
  B3 --> B1
  B1 --> B4
  B4 --> B1
  B1 --> B5
  B5 --> B3
  B1 --> B6
  B6 --> B3

  note right of B4
    Flan-T5 generates
    strict JSON (schema)
  end

  classDef infra fill:#f2f2f2,stroke:#333
  class Backend infra
```

--

## Quickstart (Docker, recommended)

1. Create `.env` from `.env.example` and set `DATABASE_URL`.

2. Build and run with Docker Compose:

```bash
docker compose up --build
```

Services started:
- `http://localhost:8000` — FastAPI
- Redis at `redis://localhost:6379`

3. Seed DB (optional):

```bash
# inside backend container or local venv
python backend/scripts/seed_db.py
```

4. Build FAISS index (manual) or use reindex endpoint which enqueues a background job:

```bash
# manual
python backend/scripts/build_faiss.py

# enqueue via API
curl -X POST http://localhost:8000/recipes/reindex
```

Check reindex status:

```bash
GET /recipes/reindex/{job_id}
```

## Local dev (venv)

```bash
cd backend
python -m venv .venv
.venv/bin/activate    # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

## Important endpoints
- `POST /analyze/` — upload image (form `file`) → returns detected labels, generated_recipe (raw text) and `generated_recipe_json` (parsed JSON schema).
- `GET /recipes/` — list recipes from DB
- `POST /recipes/reindex` — enqueue FAISS reindex job
- `GET /recipes/reindex/{job_id}` — check reindex job status

## Data/Schema
- The LLM is instructed to return a strict JSON schema with fields: `title`, `servings`, `prep_time`, `cook_time`, `cuisine`, `ingredients` (array of objects `{name,quantity,unit}`), `steps` (array), `equipment` (array), `tips` (array), `nutrition` (calories, protein, carbs, fat).

## Notes & next steps
- For production-scale LLM inference, host a model server (TGI / Triton) or use optimized containers with GPU.
- Consider a second, small model pass to validate/repair JSON if Flan-T5 outputs are inconsistent.
- Add authentication & rate-limiting for public deployment.

---

If you want, I can (A) add an admin upload endpoint to ingest large recipe JSON and trigger reindex automatically, or (B) add developer-friendly Docker Compose overrides for live coding. Which do you prefer?
