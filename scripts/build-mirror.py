#!/usr/bin/env python3
"""Publish a faithful static mirror of the original site's compiled React bundle.

Input: versioned HTML, JS, CSS and images under vendor/legacy/.
Output: dist/ with GitHub Pages-safe links and real HTML entries for each route.
Preserves the original site's styling, content, component structure and imagery.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "vendor" / "legacy"
DEST = ROOT / "dist"
CONTACT_ORIGINAL = "https://backend.leadconnectorhq.com/external-tracking/events"


def validated_base() -> str:
    base = (os.environ.get("SITE_BASE") or "/custom-design-windows/").strip()
    if not re.fullmatch(r"/(?:[A-Za-z0-9_-]+/)*", base):
        raise ValueError("SITE_BASE must be '/' or '/name/' (ending in /)")
    return base


def build() -> None:
    base = validated_base()
    manifest = json.loads((SNAPSHOT / "manifest.json").read_text(encoding="utf-8"))
    routes = manifest["routes"]
    if "/" not in routes or "/about" not in routes or "/contact" not in routes:
        raise ValueError("The original route manifest is incomplete")

    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(SNAPSHOT / "assets", DEST / "assets")

    app_file = DEST / manifest["javascript"]
    original = app_file.read_text(encoding="utf-8")
    marker = "const Yp="
    if marker not in original:
        raise ValueError("Cannot find original app entry in compiled JS")
    runtime, app = original.split(marker, 1)

    # Images were copied from the ORIGINAL live site's CDN into vendor/legacy.
    # Replace their URLs with local paths; these will survive closing the old host.
    image_rewrites = {}
    for media in manifest["media"]:
        upstream, stored = media["source"], media["file"]
        if not (DEST / stored).is_file():
            raise ValueError(f"Missing captured media: {stored}")
        image_rewrites[upstream] = base + stored
    for upstream, local in image_rewrites.items():
        runtime = runtime.replace(upstream, local)
        app = app.replace(upstream, local)

    # Original React Router uses absolute paths. This affects the APP CODE only,
    # not vendor libraries: retain exact components and all their original text.
    for route in sorted(routes, key=len, reverse=True):
        if not re.fullmatch(r"/[A-Za-z0-9/-]*", route):
            raise ValueError("Unsafe route string in original manifest: " + route)
        target = base if route == "/" else base.rstrip("/") + route
        needle = '"' + route + '"'
        if needle not in app:
            raise ValueError("Missing route in compiled original: " + route)
        app = app.replace(needle, '"' + target + '"')

    # By default, preserve the current LeadConnector form integration exactly.
    # Once CONTACT_API_URL is set, send the same existing formData payload to
    # OUR Worker and only display the original success toast after a 2xx result.
    endpoint = os.environ.get("CONTACT_API_URL", "").strip()
    if endpoint:
        parsed = urlparse(endpoint)
        if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
            raise ValueError("CONTACT_API_URL must be an HTTPS endpoint")
        legacy_call = (
            'fetch("' + CONTACT_ORIGINAL + '",{method:"POST",headers:{'
            '"Content-Type":"application/json",version:"2021-07-28"},'
            'body:JSON.stringify(l)}).catch(()=>{})'
        )
        upgraded_call = (
            'await fetch(' + json.dumps(endpoint, ensure_ascii=False) + ',{method:"POST",'
            'headers:{"Content-Type":"application/json"},body:JSON.stringify(l)})'
            '.then(response=>{if(!response.ok)throw Error("Contact request failed")})'
        )
        if app.count(legacy_call) != 1:
            raise ValueError("Cannot safely locate the original contact form POST")
        app = app.replace(legacy_call, upgraded_call)
    # Brand attribution: replace the original "Share This Page" Houzz tile
    # with the Bare Systems GitHub organization credit and its official avatar.
    # Keep the adjacent credit-card acceptance tile and all page layout intact.
    legacy_credit = (
        'c.jsxs("div",{className:"text-center",children:['
        'c.jsx("h3",{className:"font-bold mb-4",children:"Share This Page"}),'
        'c.jsx("a",{href:"https://www.houzz.com",target:"_blank",'
        'rel:"noreferrer",className:"inline-block",children:c.jsx("img",'
        '{src:"https://vibe.filesafe.space/1777487375540227367/assets/'
        '19533971-2662-4546-be89-ad9e0c3aa585.png",alt:"Houzz",'
        'className:"w-20 mx-auto"})})]})'
    )
    replacement_credit = (
        'c.jsxs("div",{className:"text-center",children:['
        'c.jsx("h3",{className:"font-bold mb-4",children:"Made by BareSystems"}),'
        'c.jsx("a",{href:"https://github.com/Bare-Systems",target:"_blank",'
        'rel:"noopener noreferrer",className:"inline-block",'
        '"aria-label":"BareSystems on GitHub",children:c.jsx("img",'
        '{src:"https://avatars.githubusercontent.com/u/262714297?v=4",'
        'alt:"BareSystems bear logo",className:"w-20 mx-auto"})})]})'
    )
    # Image URLs are normally localized earlier in the build; match the
    # rewritten local path as well as the unmodified original text.
    localized_credit = legacy_credit.replace(
        "https://vibe.filesafe.space/1777487375540227367/assets/"
        "19533971-2662-4546-be89-ad9e0c3aa585.png",
        base + "assets/19533971-2662-4546-be89-ad9e0c3aa585.png",
    )
    if app.count(localized_credit) != 1:
        raise ValueError("Cannot locate the original Houzz share tile safely")
    app = app.replace(localized_credit, replacement_credit)

    app_file.write_text(runtime + marker + app, encoding="utf-8")
    if "https://vibe.filesafe.space/" in app_file.read_text(encoding="utf-8"):
        raise ValueError("Unmigrated gallery images remain in JS")

    # Every modified JS bundle gets a content-addressed path. Without this the
    # site's original fixed Vite filename can stay cached across deployments,
    # including a previously broken copy, especially on mobile browsers.
    fingerprint = hashlib.sha256(app_file.read_bytes()).hexdigest()[:12]
    compiled_js = "assets/mirror-" + fingerprint + ".js"
    app_file.rename(DEST / compiled_js)
    (DEST / "mirror-manifest.json").write_text(
        json.dumps({"javascript": compiled_js, "original": manifest["javascript"]}, indent=2) + "\n",
        encoding="utf-8",
    )

    # The original HTML and CSS remain otherwise untouched.
    html = (SNAPSHOT / manifest["html"]).read_text(encoding="utf-8")
    html = html.replace('"/' + manifest["javascript"] + '"', '"' + base + compiled_js + '"')
    html = html.replace('"/' + manifest["stylesheet"] + '"', '"' + base + manifest["stylesheet"] + '"')
    html = html.replace('href="/favicon.svg"', 'href="' + base + 'favicon.svg"')
    for upstream, local in image_rewrites.items():
        html = html.replace(upstream, local)

    if "https://vibe.filesafe.space/" in html:
        raise ValueError("Unmigrated images in HTML")

    # This is a preview, not the live business domain: prevent indexing until
    # explicit production cutover with SITE_BASE=/ and ALLOW_INDEXING=1.
    public = base == "/" and os.environ.get("ALLOW_INDEXING") == "1"
    if not public:
        html = html.replace("</head>", '  <meta name="robots" content="noindex,nofollow" />\n  </head>')
    (DEST / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="10" fill="#1a1a1a"/>'
        '<text x="50%" y="53%" fill="#b8a970" font-family="serif"'
        ' font-size="20" text-anchor="middle" dominant-baseline="central">CW</text></svg>',
        encoding="utf-8",
    )
    for route in routes:
        target = DEST / route.lstrip("/") / "index.html" if route != "/" else DEST / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")
    (DEST / "404.html").write_text(html, encoding="utf-8")
    (DEST / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n" if public else "User-agent: *\nDisallow: /\n",
        encoding="utf-8",
    )
    print(f"Faithful original-site mirror: {len(routes)} routes, {len(image_rewrites)} photos")
    print("GitHub Pages base:", base)
    print("Contact form:", endpoint or CONTACT_ORIGINAL)
    print("Search indexing:", "enabled" if public else "disabled (preview)")


if __name__ == "__main__":
    build()
