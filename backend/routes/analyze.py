from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from clarifai_service import analyze_image_bytes, match_recipe
from schemas import AnalyzeResult

router = APIRouter(prefix="/analyze", tags=["Analyze"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 10


@router.post("/", response_model=AnalyzeResult)
async def analyze_food_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, GIF.",
        )

    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB}MB.",
        )

    # Call Clarifai
    try:
        predictions = analyze_image_bytes(image_bytes)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Top 10 labels with confidence >= 0.10
    top_labels = [p for p in predictions if p["value"] >= 0.10][:10]
    label_names = [p["name"] for p in top_labels]
    confidence_scores = [p["value"] for p in top_labels]

    # Match against our recipe DB
    matched = match_recipe(label_names, db)

    return AnalyzeResult(
        detected_labels=label_names,
        confidence_scores=confidence_scores,
        matched_recipe=matched,
        message=(
            f"Detected food items: {', '.join(label_names[:3])}. "
            + (f"Best match: {matched.title}" if matched else "No matching recipe found in database.")
        ),
    )
