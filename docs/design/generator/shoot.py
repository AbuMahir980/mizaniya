"""Render .dc.html artboards to the PNG names the repo already uses.

Most names fall out of the artboard title, but nine do not — the landing page,
the brand sheets and the printed debt record were named before the titles
settled, and the docs link to those names. The map below is the whole of that
history; nothing else about naming is special.
"""
import asyncio, io, json, os, re, sys, unicodedata
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src", "canvas")
PNG = os.path.join(HERE, "png")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

ALIAS = {
    "landing-page-1440": "11-landing-1440",
    "landing-page-390": "11-landing-390",
    "landing-page-pointer-states": "11-landing-motion",
    "the-strongest-moment-item-34": "11-landing-cycle",
    "design-stop": "00-cover",
    "mark-wordmark": "00-logo",
    "primitives": "00-primitives",
    "style": "00-style",
    "debt-record-print-a4": "05a-debt-record-print",
}


def png_name(title):
    """'07 · Home · 1440 · light' -> '07-home-1440-light.png'."""
    t = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    t = re.sub(r"-+", "-", re.sub(r"[^a-z0-9.]+", "-", t.lower())).strip("-")
    for a, b in ALIAS.items():
        if t == a or t.startswith(a + "-"):
            t = b + t[len(a):]
            break
    return t + ".png"


async def main(only=None):
    os.makedirs(PNG, exist_ok=True)
    jobs = []
    for mf in ("canvas.json", "canvas-front.json"):
        d = json.load(io.open(os.path.join(SRC, mf), encoding="utf-8"))
        for a in d["artboards"]:
            n = a["file"][:-len(".dc.html")]
            if only and n not in only:
                continue
            jobs.append((n, png_name(a["title"])))
    assert len({p for _, p in jobs}) == len(jobs), "two boards want one png"
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME,
                                    args=["--no-sandbox",
                                          "--font-render-hinting=none"])
        pg = await b.new_page(device_scale_factor=2,
                              viewport={"width": 1900, "height": 1000})
        for i, (n, png) in enumerate(jobs, 1):
            await pg.goto("file://" + os.path.join(SRC, n + ".dc.html"))
            await pg.wait_for_timeout(140)
            el = await pg.query_selector("x-dc > div")
            await el.screenshot(path=os.path.join(PNG, png))
            if i % 20 == 0:
                print(" ", i, "/", len(jobs), flush=True)
        await b.close()
    print("shot", len(jobs))

asyncio.run(main(set(sys.argv[1:]) or None))
