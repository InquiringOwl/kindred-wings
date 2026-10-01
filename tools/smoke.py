"""Smoke test for Kindred Wings (run in Claude's cloud container, not the Mac):
    python3 -m http.server 8765 &   (from the repo root)
    python3 tools/smoke.py
Opens every bird and animal, logs a sighting, saves a meaning, adds a bird with photos,
drops a map pin, checks for JS errors, and writes screenshots to tools/shots/."""
import os, sys
from PIL import Image
from playwright.sync_api import sync_playwright
URL = os.environ.get("KW_URL", "http://localhost:8765/")
os.makedirs("tools/shots", exist_ok=True)
COVER, REAL = "tools/shots/_cover.jpg", "tools/shots/_real.png"
Image.new("RGB", (1600, 1200), (200, 120, 60)).save(COVER)
Image.new("RGB", (800, 800), (60, 120, 200)).save(REAL)
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1200, 1400), (390, 844)]:
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("dialog", lambda d: d.accept())
        if os.environ.get("KW_FONT"):   # offline containers: serve Macondo from a local .ttf
            font = open(os.environ["KW_FONT"], "rb").read()
            pg.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(content_type="text/css", body="@font-face{font-family:Macondo;src:url(https://fonts.gstatic.com/kw.ttf)}"))
            pg.route("https://fonts.gstatic.com/**", lambda r: r.fulfill(content_type="font/ttf", body=font))
        pg.goto(URL); pg.wait_for_timeout(800)
        pg.screenshot(path=f"tools/shots/guide-{w}.png")
        for show in ["m", "f", "y"]:
            pg.click(f'[data-show="{show}"]')
        ids = pg.eval_on_selector_all("#grid [data-open]", "els=>els.map(e=>e.dataset.open)")
        for i in ids:
            pg.click(f'[data-open="{i}"]'); pg.click("#xBtn")
        pg.click('[data-show="m"]')
        pg.click('[data-open="american-robin"]'); pg.fill("#sDate", "09/30/26"); pg.click("#addSight")
        pg.click("#editBtn"); pg.fill("#myText", "test meaning"); pg.fill("#myMonth", "09/26"); pg.click("#saveMeaning")
        pg.screenshot(path=f"tools/shots/detail-{w}.png"); pg.click("#xBtn")
        # add a bird with a cover and a real photo
        pg.click("#addBird"); pg.fill("#bdName", "Varied Thrush")
        pg.click('[data-bsize="medium"]'); pg.click('[data-bcolor="orange"]'); pg.click('[data-bcolor="gray"]')
        with pg.expect_file_chooser() as fc: pg.click("#bdCover")
        fc.value.set_files(COVER); pg.wait_for_selector("#bdCoverPrev img")
        with pg.expect_file_chooser() as fc: pg.click("#bdReal")
        fc.value.set_files(REAL); pg.wait_for_selector("#bdRealPrev img")
        pg.fill("#bdKeys", "hidden song, winter"); pg.screenshot(path=f"tools/shots/addbird-{w}.png", full_page=True)
        pg.click("#bdSave"); pg.wait_for_timeout(400)
        cid = pg.evaluate("state.custom.find(c=>c.kind==='bird').id")
        assert pg.evaluate(f"!!(state.photos['{cid}']&&state.photos['{cid}'].cover&&state.photos['{cid}'].a)"), "bird photos not saved"
        pg.click(f'[data-open="{cid}"]'); pg.fill("#sDate", "10/01/26"); pg.click("#pinAfter"); pg.click("#addSight")
        pg.wait_for_selector(".mapbox.placing")
        box = pg.locator("svg.sfmap").bounding_box()
        pg.mouse.click(box["x"] + box["width"] * 0.30, box["y"] + box["height"] * 0.52)   # Golden Gate Park-ish
        pg.wait_for_timeout(300)
        n = pg.evaluate("state.sightings.filter(s=>typeof s.lat==='number').length")
        assert n == 1, f"pin not dropped ({n})"
        pg.click('[data-pinfor]:not(.has)'); pg.wait_for_selector(".mapbox.placing")
        pg.mouse.click(box["x"] + box["width"] * 0.62, box["y"] + box["height"] * 0.45)
        pg.wait_for_timeout(300)
        pg.screenshot(path=f"tools/shots/map-{w}.png", full_page=True)
        pg.click('[data-zoom="in"]'); pg.click('[data-zoom="in"]'); pg.wait_for_timeout(200)
        pg.locator("#mapcard").screenshot(path=f"tools/shots/mapzoom-{w}.png")
        pg.click('[data-tab="beyond"]'); pg.wait_for_timeout(200)
        for i in pg.eval_on_selector_all(".grid [data-open]", "els=>els.map(e=>e.dataset.open)"):
            pg.click(f'[data-open="{i}"]'); pg.click("#xBtn")
        pg.screenshot(path=f"tools/shots/beyond-{w}.png", full_page=True)
        pg.click('[data-tab="guide"]'); pg.wait_for_timeout(200)
        pg.screenshot(path=f"tools/shots/guide2-{w}.png", full_page=True)
        pg.click('[data-tab="settings"]'); pg.screenshot(path=f"tools/shots/settings-{w}.png")
        pg.evaluate("localStorage.clear(); indexedDB.deleteDatabase('kindred-wings')")
        pg.close()
    b.close()
for f in (COVER, REAL): os.remove(f)
print("errors:", errs or "none")
sys.exit(1 if errs else 0)
