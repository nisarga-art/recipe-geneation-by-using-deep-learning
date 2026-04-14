from fastapi import APIRouter, Body, HTTPException, Depends
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/train", tags=["Training"])


class TrainRequest(BaseModel):
    dataset_path: str
    epochs: int | None = None
    batch_size: int | None = None
    lr: float | None = None


class TrainResponse(BaseModel):
    status: str
    best_val_accuracy: float | None = None
    model_path: str | None = None
    log_path: str | None = None
    message: str | None = None


@router.post("/classifier", response_model=TrainResponse)
def train_classifier(
    req: TrainRequest = Body(...),
    db: Session = Depends(get_db),
):
    """Retrain the dish classifier on an ImageFolder-style dataset.

    Example request body:
      { "dataset_path": "data/classifier", "epochs": 8 }
    """
    try:
        from ..dish_classifier import train as train_fn, _MODEL_PATH
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classifier module not available: {e}")

    dataset_path = req.dataset_path
    epochs = req.epochs
    batch_size = req.batch_size
    lr = req.lr

    try:
        # prepare log path
        from datetime import datetime
        logs_dir = Path("backend/logs")
        logs_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        log_file = logs_dir / f"train_{ts}.csv"
        best_acc = train_fn(data_dir=dataset_path, epochs=epochs, batch_size=batch_size, lr=lr, log_path=str(log_file))
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")

    return TrainResponse(
        status="ok",
        best_val_accuracy=float(best_acc) if best_acc is not None else None,
        model_path=str(_MODEL_PATH),
        log_path=str(log_file),
        message="Training completed",
    )


@router.post("/train_classifier", response_model=TrainResponse)
def train_classifier_alias(
    req: TrainRequest = Body(...),
    db: Session = Depends(get_db),
):
    """Compatibility alias for older clients: POST /train_classifier

    Delegates to `/train/classifier` implementation and returns same response.
    """
    return train_classifier(req=req, db=db)
