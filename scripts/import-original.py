#!/usr/bin/env python3
"""Snapshot the live Custom Design Windows frontend for self-contained hosting.

The upstream site is currently a static Vite/React application. This captures
the exact HTML, compiled JS/CSS, and image assets referenced by those files.
It deliberately does not rewrite source bytes; scripts/build-mirror.py handles
GitHub Pages base paths when publishing.
"""
from __future__ import annotations

import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "vendor" / "legacy"
ORIGIN = "https://www.customdesignwindows.com"
MEDIA_URL = re.compile(
    r"https://vibe\.filesafe\.space/\d+/assets/([A-Za-z0-9_.-]+\.(?:jpe?g|png|webp|svg|gif))",
    re.IGNORECASE,
)


def download(url: str, target: Path):
    target.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "curl", "--fail", "--location", "--compressed", "--silent",
            "--show-error", "--retry", "2", "--max-time", "50",
            "--output", str(target), url,
        ],
        check=True,
    )
    if not target.is_file() or target.stat().st_size == 0:
        raise RuntimeError("Empty download: " + url)
    if target.stat().st_size > 18 * 1024 * 1024:
        raise RuntimeError("Unexpectedly large asset: " + url)
    print(f"{target.relative_to(ROOT)} — {target.stat().st_size:,} bytes")


def main():
    index = DEST / "index.html"
    download(ORIGIN + "/", index)
    markup = index.read_text(encoding="utf-8")

    scripts = re.findall(r'(?:src)=["\'](/assets/[^"\']+\.js)["\']', markup)
    styles = re.findall(r'(?:href)=["\'](/assets/[^"\']+\.css)["\']', markup)
    if len(scripts) != 1 or len(styles) != 1:
        raise RuntimeError(f"Expected one Vite JS/CSS asset, found {scripts=} {styles=}")

    for path in scripts + styles:
        download(ORIGIN + path, DEST / path.lstrip("/"))

    js = (DEST / scripts[0].lstrip("/")).read_text(encoding="utf-8")
    css = (DEST / styles[0].lstrip("/")).read_text(encoding="utf-8")
    media_urls = set(MEDIA_URL.finditer(markup + js + css))
    assets = sorted({m.group(0): m.group(1) for m in media_urls}.items())
    if len(assets) < 10:
        raise RuntimeError(f"Expected project gallery media (10+ files); found {len(assets)}")

    for url, filename in assets:
        download(url, DEST / "assets" / filename)

    app_index = js.find('const Yp=')
    if app_index == -1:
        raise RuntimeError("Could not locate the original application route table")
    route_strings = sorted(set(re.findall(
        r'path:"(/[^"]*)"', js[app_index:],
    )))
    if "/" not in route_strings or "/about" not in route_strings:
        raise RuntimeError(f"Expected home and about routes; found {route_strings}")

    inventory = {
        "origin": ORIGIN,
        "capturedAt": datetime.now(timezone.utc).isoformat(),
        "html": "index.html",
        "javascript": scripts[0].lstrip("/"),
        "stylesheet": styles[0].lstrip("/"),
        "mediaCount": len(assets),
        "routes": route_strings,
        "media": [{"source": url, "file": "assets/" + name} for url, name in assets],
        "note": (
            "Compiled production snapshot, not editable React source. "
            "Re-run the import workflow while the original site is accessible "
            "to refresh the snapshot."
        ),
    }
    (DEST / "manifest.json").write_text(
        json.dumps(inventory, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("Routes:", route_strings)
    print("Image assets captured:", len(assets))


if __name__ == "__main__":
    main()
