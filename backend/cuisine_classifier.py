import json
from pathlib import Path
from typing import List
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = Path("backend/models/cuisine_classifier.pth")
CLASSES_PATH = MODEL_PATH.with_suffix(".classes.json")

_MODEL = None
_CLASSES = None

def _load():
    global _MODEL, _CLASSES
    if _MODEL is not None:
        return

    if not MODEL_PATH.exists():
        return

    with open(CLASSES_PATH, "r") as f:
        _CLASSES = json.load(f)

    model = models.resnet18(pretrained=False)
    model.fc = nn.Linear(model.fc.in_features, len(_CLASSES))

    state = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state)
    model.eval()

    _MODEL = model


def predict(image_bytes: bytes) -> str:
    _load()
    if _MODEL is None:
        return "Unknown"

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
    ])

    from io import BytesIO
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        out = _MODEL(x)
        pred = out.argmax(dim=1).item()

    return _CLASSES[pred]