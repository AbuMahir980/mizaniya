"""Measure every artboard's rendered box. The canvas manifests carry w/h, and a
manifest whose figures are stale lays boards over each other."""
import asyncio, glob, json, os, sys
from playwright.async_api import async_playwright
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "canvas")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"


async def main():
    names = sorted(os.path.basename(p)[:-len(".dc.html")]
                   for p in glob.glob(os.path.join(SRC, "*.dc.html")))
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1900, "height": 1000})
        for i, n in enumerate(names, 1):
            await pg.goto("file://" + os.path.join(SRC, n + ".dc.html"))
            el = await pg.query_selector("x-dc > div")
            box = await el.bounding_box()
            out[n] = {"w": round(box["width"]), "h": round(box["height"])}
            if i % 60 == 0:
                print(" ", i, "/", len(names), flush=True)
        await b.close()
    json.dump(out, open(os.path.join(os.path.dirname(SRC), "..", "sizes.json"), "w"),
              indent=1)
    print("measured", len(out))

asyncio.run(main())
