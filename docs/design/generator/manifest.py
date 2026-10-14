# -*- coding: utf-8 -*-
"""manifest.py — rebuild canvas.json and canvas-front.json from the boards.

The editor caps a canvas at 200 file entries, so the two manifests stay split
the way they were: the app in one, everything around it in the other. Layout is
computed rather than carried: columns are as wide as the widest board that lands
in them and rows as tall as the tallest, which is the only way a note that grew
by two lines cannot push one board under another.
"""
import io, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mz

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = mz.SRC
GAP_X, GAP_Y = 140, 190
SIZES = json.load(io.open(os.path.join(HERE, "sizes.json"), encoding="utf-8"))


def row(stem, title, both=True):
    """One screen: 1440 light, 360 light, 1440 dark, 360 dark — or just the two
    wide boards when a screen has no 360 version."""
    if both:
        return [(f"Web{stem}Light", f"{title} · 1440 · light"),
                (f"Mw{stem}Light", f"{title} · 360 · light"),
                (f"Web{stem}Dark", f"{title} · 1440 · dark"),
                (f"Mw{stem}Dark", f"{title} · 360 · dark")]
    return [(f"Web{stem}Light", f"{title} · 1440 · light"),
            (f"Web{stem}Dark", f"{title} · 1440 · dark")]


def lay(page, rows):
    """Place a page's rows on the grid and return artboard records."""
    ncol = max(len(r) for r in rows)
    colw = [max((SIZES[n]["w"] for r in rows for j, (n, _) in enumerate(r)
                 if j == i), default=0) for i in range(ncol)]
    xs, x = [], 0
    for w in colw:
        xs.append(x)
        x += w + GAP_X
    out, y = [], 0
    for r in rows:
        for i, (name, title) in enumerate(r):
            s = SIZES[name]
            out.append({"file": name + ".dc.html", "x": xs[i], "y": y,
                        "w": s["w"], "h": s["h"], "title": title,
                        "page": page, "print": "fixed"})
        y += max(SIZES[n]["h"] for n, _ in r) + GAP_Y
    return out


def keep(old, page, order):
    """Rows for a page that has not changed, in the order it already had."""
    by = {a["file"][:-len(".dc.html")]: a["title"]
          for a in old["artboards"] if a["page"] == page}
    rows = []
    for group in order:
        r = [(n, by[n]) for n in group if n in by]
        assert len(r) == len(group), (page, [n for n in group if n not in by])
        rows.append(r)
    assert sum(len(r) for r in rows) == len(by), (page, sum(len(r) for r in rows),
                                                  len(by))
    return rows


def grouped(old, page):
    """Recover a committed page's rows from its own y coordinates."""
    xs = [a for a in old["artboards"] if a["page"] == page]
    ys = sorted({a["y"] for a in xs})
    rows = []
    for y in ys:
        r = sorted((a for a in xs if a["y"] == y), key=lambda a: a["x"])
        rows.append([(a["file"][:-len(".dc.html")], a["title"]) for a in r])
    return rows


def write(path, pages, artboards, annotations, launch):
    doc = {"version": 1, "launch": launch, "pages": pages,
           "artboards": artboards, "annotations": annotations}
    io.open(os.path.join(SRC, path), "w", encoding="utf-8").write(
        json.dumps(doc, ensure_ascii=False, indent=1))
    n = len(artboards)
    assert n <= 200, (path, n)
    return n
