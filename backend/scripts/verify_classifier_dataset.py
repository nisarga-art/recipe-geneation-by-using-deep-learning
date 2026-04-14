#!/usr/bin/env python3
"""Verify ImageFolder dataset for dish classifier.

Scans `target` (default `data/classifier`) for subfolders (classes), counts images,
prints stats, and warns if any class has fewer than N images (default 200).
Also reports imbalance ratios and suggests simple remediation steps.
"""
from __future__ import annotations

from pathlib import Path
from collections import Counter
import argparse
import math

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in IMAGE_EXTS


def scan_dataset(root: Path) -> Counter:
    counts = Counter()
    if not root.exists() or not root.is_dir():
        raise FileNotFoundError(f"Dataset root not found: {root}")
    for cls_dir in sorted(root.iterdir()):
        if not cls_dir.is_dir():
            continue
        cnt = 0
        for f in cls_dir.iterdir():
            if is_image(f):
                cnt += 1
        counts[cls_dir.name] = cnt
    return counts


def print_report(counts: Counter, min_count: int = 200) -> None:
    total = sum(counts.values())
    classes = len(counts)
    print(f"Dataset root classes: {classes}")
    print(f"Total images: {total}")
    if classes == 0:
        print("No class folders found under dataset root.")
        return

    print("\nImages per class:")
    for cls, c in counts.most_common():
        mark = "" if c >= min_count else " <-- BELOW MIN"
        print(f"  {cls}: {c}{mark}")

    min_c = min(counts.values())
    max_c = max(counts.values())
    mean = total / classes if classes else 0
    std_dev = math.sqrt(sum((c - mean) ** 2 for c in counts.values()) / classes) if classes else 0
    imbalance_ratio = (max_c / min_c) if min_c > 0 else float('inf')

    print("\nSummary:")
    print(f"  min: {min_c}")
    print(f"  max: {max_c}")
    print(f"  mean: {mean:.1f}")
    print(f"  std dev: {std_dev:.1f}")
    print(f"  imbalance ratio (max/min): {imbalance_ratio:.2f}")

    # warnings
    if min_c < min_count:
        print("\nWARNING: Some classes have fewer than the recommended minimum images.")
        print(f"Recommend at least {min_count} images per class for stable training.")
        few = [cls for cls, c in counts.items() if c < min_count]
        print(f"Classes below minimum ({len(few)}): {', '.join(few)}")

    if imbalance_ratio > 2.0:
        print("\nNOTE: Dataset is imbalanced. Consider the following remediation steps:")
        print("  - Collect more images for minority classes (best).")
        print("  - Augment minority classes with flips/rotations/color jitter.")
        print("  - Downsample majority classes to match minority class size.")
        print("  - Use class-weighting or focal loss during training to compensate.")


def main():
    p = argparse.ArgumentParser(description="Verify classifier ImageFolder dataset structure and balance")
    p.add_argument("--root", default="data/classifier", help="Dataset root directory (ImageFolder)")
    p.add_argument("--min-count", type=int, default=200, help="Minimum recommended images per class")
    args = p.parse_args()

    root = Path(args.root)
    try:
        counts = scan_dataset(root)
    except FileNotFoundError as e:
        print(e)
        return

    print_report(counts, min_count=args.min_count)


if __name__ == "__main__":
    main()
