#!/usr/bin/env python3
"""Verify that the GitHub Pages build is the original site, not a redesign."""
import json
import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
manifest = json.loads((root / "vendor/legacy/manifest.json").read_text())
base = os.getenv("SITE_BASE", "/custom-design-windows/")
if base == "":
    base = "/custom-design-windows/"

app = (dist / manifest["javascript"]).read_text()
html = (dist / "index.html").read_text()
style = dist / manifest["stylesheet"]

assert style.is_file(), "Original stylesheet was not copied"
assert "const Yp=" in app, "Original React app missing"
assert "Custom Design Windows" in app, "Original content absent"
assert "Made by BareSystems" in app, "BareSystems credit was not rendered"
assert "https://github.com/Bare-Systems" in app, "BareSystems GitHub link missing"
assert "https://avatars.githubusercontent.com/u/262714297?v=4" in app, "GitHub bear avatar missing"
assert "Share This Page" not in app, "Legacy share heading still present"
assert "https://www.houzz.com" not in app, "Legacy Houzz link still present"
assert "We Accept All Major Credit Cards" in app, "Adjacent payment tile was changed"
assert "Dale Ellen Iarossi" in app, "Original company history absent"
assert "Custom Design Windows" in html, "Original page metadata absent"

for media in manifest["media"]:
    assert (dist / media["file"]).is_file(), f"Missing original media {media['file']}"
    assert media["source"] not in app, f"External image URL not migrated: {media['file']}"

for path in manifest["routes"]:
    entry = dist / (path.lstrip("/") + "/index.html" if path != "/" else "index.html")
    assert entry.is_file(), f"Missing route {path}"
    if path != "/":
        target = base.rstrip("/") + path
        assert '"' + target + '"' in app, f"Router path not rebased: {path}"

assert (dist / "404.html").is_file()
assert (dist / "robots.txt").is_file()
assert ('"' + base + manifest["javascript"] + '"') in html, "Wrong JS path"
assert ('"' + base + manifest["stylesheet"] + '"') in html, "Wrong CSS path"
assert "https://vibe.filesafe.space/" not in app, "Media CDN still referenced"
endpoint = os.environ.get("CONTACT_API_URL", "").strip()
if endpoint:
    assert endpoint in app, "Configured Worker endpoint not present"
    assert "Contact request failed" in app, "Form does not await sending result"
else:
    assert "https://backend.leadconnectorhq.com/external-tracking/events" in app, "Original form integration absent"
print(f"Verified exact-site snapshot, {len(manifest['routes'])} routes and {len(manifest['media'])} local images")
