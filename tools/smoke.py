"""Smoke test for Kindred Wings (run in Claude's cloud container, not the Mac):
    python3 -m http.server 8765 &   (from the repo root)
    python3 tools/smoke.py
Opens every bird and animal, logs a sighting, saves a meaning, checks for JS errors,
and writes screenshots to tools/shots/."""
import os, sys
from playwright.sync_api import sync_playwright
URL = os.environ.get("KW_URL", "http://localhost:8765/")
os.makedirs("tools/shots", exist_ok=True)
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1200, 1400), (390, 844)]:
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(800)
        pg.screenshot(path=f"tools/shots/guide-{w}.png")
        for show in ["m", "f", "y"]:
            pg.click(f'[data-show="{show}"]')
        ids = pg.eval_on_selector_all("#grid [data-open]", "els=>els.map(e=>e.dataset.open)")
        for i in ids:
            pg.click(f'[data-open="{i}"]'); pg.click("#xBtn")
        pg.click('[data-open="american-robin"]'); pg.fill("#sDate", "09/30/26"); pg.click("#addSight")
        pg.click("#editBtn"); pg.fill("#myText", "test meaning"); pg.fill("#myMonth", "09/26"); pg.click("#saveMeaning")
        pg.screenshot(path=f"tools/shots/detail-{w}.png"); pg.click("#xBtn")
        pg.click('[data-tab="beyond"]'); pg.wait_for_timeout(200)
        for i in pg.eval_on_selector_all(".grid [data-open]", "els=>els.map(e=>e.dataset.open)"):
            pg.click(f'[data-open="{i}"]'); pg.click("#xBtn")
        pg.screenshot(path=f"tools/shots/beyond-{w}.png", full_page=True)
        pg.click('[data-tab="log"]'); pg.screenshot(path=f"tools/shots/log-{w}.png")
        pg.click('[data-tab="settings"]'); pg.screenshot(path=f"tools/shots/settings-{w}.png")
        pg.close()
    b.close()
print("errors:", errs or "none")
sys.exit(1 if errs else 0)
