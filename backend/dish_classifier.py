"""Simple PyTorch-based dish classifier wrapper.

Provides training CLI (`train()`) and runtime `predict()` to return top-K dish labels
from a saved model. Expects dataset organized as ImageFolder: one folder per dish.

Model artifacts are saved as a state dict and a `classes.json` file next to it.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import List

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from .config import settings


_MODEL: torch.nn.Module | None = None
_CLASSES: List[str] | None = None
_MODEL_PATH: Path = Path(settings.CLASSIFIER_MODEL_PATH)
_CLASSES_PATH: Path = _MODEL_PATH.with_suffix(".classes.json")


# ---------------------------
# LOAD MODEL (UPDATED)
# ---------------------------
def load_model():
    global _MODEL, _CLASSES

    if _MODEL is not None and _CLASSES is not None:
        return _MODEL

    # ensure model and classes files exist
    if not _MODEL_PATH.exists() or not _CLASSES_PATH.exists():
        _MODEL = None
        _CLASSES = None
        return None

    try:
        with open(_CLASSES_PATH, "r", encoding="utf-8") as fh:
            _CLASSES = json.load(fh)

        num_classes = len(_CLASSES)

        model = models.resnet18(pretrained=False)
        model.fc = nn.Linear(model.fc.in_features, num_classes)

        state = torch.load(_MODEL_PATH, map_location="cpu")
        model.load_state_dict(state)

        model.eval()
        _MODEL = model

    except Exception as e:
        # keep failures quiet but helpful in logs
        print(f"Failed to load classifier model: {e}")
        _MODEL = None
        _CLASSES = None

    return _MODEL


# ---------------------------
# PREDICT (MAIN FIX)
# ---------------------------
def predict(image_bytes: bytes, topk: int = 3) -> List[dict]:
    """Return list of {name: str, value: float} sorted by confidence desc."""

    model = load_model()

    if model is None or _CLASSES is None:
        return []

    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    try:
        from io import BytesIO
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return []

    input_t = preprocess(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(input_t)
        probs = torch.softmax(logits, dim=-1).squeeze(0)

        topk_vals, topk_idx = torch.topk(
            probs, min(topk, probs.shape[0])
        )

    results = []

    for v, i in zip(topk_vals.tolist(), topk_idx.tolist()):
        results.append({
            "name": _CLASSES[i],
            "value": float(v),
            "source": "classifier"   # 🔥 IMPORTANT
        })

    return results


# ---------------------------
# TRAIN (UNCHANGED)
# ---------------------------
def train(
    data_dir: str,
    output_path: str | None = None,
    epochs: int | None = None,
    batch_size: int | None = None,
    lr: float | None = None,
    device: str | None = None,
    val_split: float = 0.2,
    save_best: bool = True,
    seed: int = 42,
    log_path: str | None = None,
) -> None:

    import os
    from torchvision.datasets import ImageFolder
    from torch.utils.data import DataLoader, random_split

    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    output_path = Path(output_path or _MODEL_PATH)

    epochs = int(epochs or settings.CLASSIFIER_EPOCHS)
    batch_size = int(batch_size or settings.CLASSIFIER_BATCH_SIZE)
    lr = float(lr or settings.CLASSIFIER_LR)

    data_dir = Path(data_dir)
    if not data_dir.exists():
        raise FileNotFoundError(f"Data dir not found: {data_dir}")

    transform_train = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    transform_val = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    full_dataset = ImageFolder(str(data_dir), transform=transform_train)
    classes = full_dataset.classes
    num_classes = len(classes)

    if num_classes == 0:
        raise ValueError("No classes found in dataset")

    total = len(full_dataset)
    val_size = int(total * val_split)
    train_size = total - val_size

    generator = torch.Generator().manual_seed(seed)
    train_ds, val_ds = random_split(full_dataset, [train_size, val_size], generator=generator)

    val_ds.dataset = ImageFolder(str(data_dir), transform=transform_val)
    if val_size > 0:
        val_ds = torch.utils.data.Subset(val_ds.dataset, val_ds.indices)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4) if val_size > 0 else None

    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_acc = 0.0
    best_state = None

    for ep in range(1, epochs + 1):

        model.train()
        running_loss = 0.0
        running_correct = 0
        running_total = 0

        for xb, yb in train_loader:
            xb = xb.to(device)
            yb = yb.to(device)

            optimizer.zero_grad()
            out = model(xb)
            loss = criterion(out, yb)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * xb.size(0)
            preds = out.argmax(dim=1)
            running_correct += (preds == yb).sum().item()
            running_total += xb.size(0)

        train_acc = running_correct / running_total if running_total else 0.0

        val_acc = 0.0
        if val_loader is not None:
            model.eval()
            v_correct = 0
            v_total = 0

            with torch.no_grad():
                for xb, yb in val_loader:
                    xb = xb.to(device)
                    yb = yb.to(device)
                    out = model(xb)
                    preds = out.argmax(dim=1)
                    v_correct += (preds == yb).sum().item()
                    v_total += xb.size(0)

            val_acc = v_correct / v_total if v_total else 0.0

        print(f"Epoch {ep}/{epochs} train_acc={train_acc:.4f} val_acc={val_acc:.4f}")

        if val_acc > best_acc:
            best_acc = val_acc
            best_state = model.state_dict()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(best_state if best_state else model.state_dict(), str(output_path))

    with open(output_path.with_suffix(".classes.json"), "w", encoding="utf-8") as fh:
        json.dump(classes, fh)

    print(f"Saved model to {output_path} (best_val_acc={best_acc:.4f})")