"""Measure the how-it-works rail: every card's box and every answer's line count."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "canvas")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

JS = """() => {
  const out = [];
  // a rail card: the only blocks carrying a 2-digit mono index inside a flex row
  const idx = [...document.querySelectorAll('.mono')].filter(
      e => /^\\d\\d$/.test(e.textContent.trim()));
  for (const m of idx) {
    const card = m.parentElement;
    const kids = [...card.children];
    const q = kids[1], a = kids[2];
    const cs = getComputedStyle(a);
    const lh = parseFloat(cs.lineHeight);
    out.push({
      n: m.textContent.trim(),
      cardH: Math.round(card.getBoundingClientRect().height),
      cardW: Math.round(card.getBoundingClientRect().width),
      qH: Math.round(q.getBoundingClientRect().height),
      aH: Math.round(a.getBoundingClientRect().height),
      aLines: Math.round(a.getBoundingClientRect().height / lh),
      text: a.textContent.trim(),
    });
  }
  return out;
}"""

async def main():
    boards = sys.argv[1:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1900, "height": 1200},
                              device_scale_factor=1)
        for n in boards:
            await pg.goto("file://" + os.path.join(SRC, n + ".dc.html"))
            await pg.wait_for_timeout(120)
            rows = await pg.evaluate(JS)
            print("═══", n, f"({len(rows)} cards)")
            if not rows:
                continue
            tall = max(r["cardH"] for r in rows)
            for r in rows:
                flag = " ←tallest" if r["cardH"] == tall else ""
                print(f'  {r["n"]} w{r["cardW"]:>4} h{r["cardH"]:>4} '
                      f'ans {r["aLines"]}L/{r["aH"]:>3}px{flag}  {r["text"][:52]}')
            print(f'  card height = {tall}px, '
                  f'max answer lines = {max(r["aLines"] for r in rows)}')
        await b.close()

asyncio.run(main())
