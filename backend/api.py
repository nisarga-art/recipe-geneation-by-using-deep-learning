from fastapi import FastAPI, UploadFile, File
import torch
from backend.dish_classifier import predict

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Dish Classifier API Running"}

@app.post("/predict")
async def predict_dish(file: UploadFile = File(...)):
    image_bytes = await file.read()

    result = predict(image_bytes)

    if not result:
        return {"error": "Prediction failed"}

    top = result[0]

    return {
        "dish": top["name"],
        "confidence": top["value"],
        "top3": result
    }