#!/usr/bin/env python3
"""Prepare classifier dataset in ImageFolder format.

Usage examples:
  # Build dataset from images placed in class-named subfolders
  python backend/scripts/prepare_classifier_dataset.py --source raw_images --by-folder

  # Build dataset by extracting class from filenames (e.g., Paneer-123.jpg or Dosa_001.jpg)
  python backend/scripts/prepare_classifier_dataset.py --source raw_images --pattern "^([A-Za-z0-9 ]+)[-_]" --target data/classifier

The script copies image files into `target/<class_name>/` and prints counts per class.
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path
import re
from collections import defaultdict
from typing import Dict


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def is_image(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in IMAGE_EXTS


def normalize_class_name(name: str) -> str:
    # replace spaces with underscore and strip
    return re.sub(r"\s+", "_", name.strip())


def prepare_from_folders(source: Path, target: Path, copy: bool = True, dry_run: bool = False) -> Dict[str, int]:
    counts = defaultdict(int)
    for child in sorted(source.iterdir()):
        if not child.is_dir():
            continue
        cls_name = normalize_class_name(child.name)
        dest_dir = target / cls_name
        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)
        for f in sorted(child.iterdir()):
            if not is_image(f):
                continue
            dest = dest_dir / f.name
            if dry_run:
                print(f"DRY: would copy {f} -> {dest}")
            else:
                if copy:
                    shutil.copy2(str(f), str(dest))
                else:
                    shutil.move(str(f), str(dest))
            counts[cls_name] += 1
    return counts


def prepare_from_filenames(source: Path, target: Path, pattern: str, copy: bool = True, dry_run: bool = False) -> Dict[str, int]:
    counts = defaultdict(int)
    regex = re.compile(pattern)
    for f in sorted(source.rglob("*")):
        if not is_image(f):
            continue
        m = regex.search(f.name)
        if not m:
            print(f"Skipping (no class match): {f}")
            continue
        cls_raw = m.group(1)
        cls_name = normalize_class_name(cls_raw)
        dest_dir = target / cls_name
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f.name
        if dry_run:
            print(f"DRY: would copy {f} -> {dest}")
        else:
            if copy:
                shutil.copy2(str(f), str(dest))
            else:
                shutil.move(str(f), str(dest))
        counts[cls_name] += 1
    return counts


def print_stats(counts: Dict[str, int], min_count: int = 0) -> None:
    total = sum(counts.values())
    classes = len(counts)
    print(f"Total images: {total}")
    print(f"Classes: {classes}")
    print("Images per class:")
    for cls, c in sorted(counts.items(), key=lambda x: -x[1]):
        flag = "" if c >= min_count else " <-- BELOW MIN"
        print(f"  {cls}: {c}{flag}")


def main():
    p = argparse.ArgumentParser(description="Prepare ImageFolder dataset for dish classifier")
    p.add_argument("--source", required=True, help="Source directory with images or subfolders")
    p.add_argument("--target", default="data/classifier", help="Target dataset root (ImageFolder)")
    p.add_argument("--by-folder", action="store_true", help="Treat immediate subfolders of source as class folders")
    p.add_argument("--pattern", default=r"^([A-Za-z0-9 ]+)[-_]", help="Regex to extract class from filename (captures group 1)")
    p.add_argument("--no-copy", action="store_true", help="Move files instead of copying")
    p.add_argument("--dry-run", action="store_true", help="Show actions without copying/moving files")
    p.add_argument("--min-count", type=int, default=0, help="Minimum desired images per class for reporting")
    args = p.parse_args()

    source = Path(args.source)
    target = Path(args.target)
    if not source.exists():
        print(f"Source not found: {source}")
        return

    copy = not args.no_copy

    if args.by_folder:
        counts = prepare_from_folders(source, target, copy=copy, dry_run=args.dry_run)
    else:
        counts = prepare_from_filenames(source, target, args.pattern, copy=copy, dry_run=args.dry_run)

    print_stats(counts, min_count=args.min_count)


if __name__ == "__main__":
    main()
