"""Smoke test for Kindred Creatures (run in Claude's cloud container, not the Mac):
    python3 -m http.server 8765 &   (from the repo root)
    python3 tools/smoke.py
Opens every section and every entry, filters by protection, logs a sighting, saves and confirms meanings,
confirms a plant use, adds a bird with photos, drops a map pin, opens Laws, checks for JS errors and
writes screenshots to tools/shots/. If Google Fonts is blocked, point KW_FONT at Macondo-Regular.ttf and
KW_FONT_SANS / KW_FONT_SANS_I at Nunito's variable .ttf files."""
import os, sys
from PIL import Image
from playwright.sync_api import sync_playwright
URL = os.environ.get("KW_URL", "http://localhost:8765/")
os.makedirs("tools/shots", exist_ok=True)
COVER, REAL = "tools/shots/_cover.jpg", "tools/shots/_real.png"
Image.new("RGB", (1600, 1200), (200, 120, 60)).save(COVER)
Image.new("RGB", (800, 800), (60, 120, 200)).save(REAL)
FONTS = [(k, os.environ.get(v)) for k, v in [("mac", "KW_FONT"), ("sans", "KW_FONT_SANS"), ("sansi", "KW_FONT_SANS_I")]]
errs = []
def fonts(pg):
    have = {k: open(p, "rb").read() for k, p in FONTS if p}
    if not have: return
    css = ""
    if "mac" in have: css += "@font-face{font-family:Macondo;src:url(https://fonts.gstatic.com/kw/mac.ttf)}"
    if "sans" in have: css += "@font-face{font-family:Nunito;font-weight:200 1000;src:url(https://fonts.gstatic.com/kw/sans.ttf)}"
    if "sansi" in have: css += "@font-face{font-family:Nunito;font-style:italic;font-weight:200 1000;src:url(https://fonts.gstatic.com/kw/sansi.ttf)}"
    pg.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(content_type="text/css", body=css))
    pg.route("https://fonts.gstatic.com/**", lambda r: r.fulfill(content_type="font/ttf", body=have.get(r.request.url.rsplit("/", 1)[-1][:-4], b"")))
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1200, 1400), (390, 844)]:
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("dialog", lambda d: d.accept())
        fonts(pg)
        if os.environ.get("KW_OFFLINE"): pg.route("https://*.amazonaws.com/**", lambda r: r.abort())
        pg.goto(URL); pg.wait_for_timeout(900)
        pg.screenshot(path=f"tools/shots/birds-{w}.png")
        for show in ["m", "f", "y"]:
            pg.click(f'[data-show="{show}"]')
        pg.click('[data-show="m"]')
        n_all = pg.eval_on_selector_all("#grid [data-open]", "e=>e.length")
        pg.click('[data-prot="mbta"]'); n_mbta = pg.eval_on_selector_all("#grid [data-open]", "e=>e.length")
        pg.click('[data-prot="mbta"]')
        assert 0 < n_mbta < n_all, f"MBTA filter {n_mbta}/{n_all}"
        # every section, every entry
        for tab in ["birds", "animals", "insects", "trees", "flowers", "greenery"]:
            pg.click(f'nav.tabs [data-tab="{tab}"]')
            secs = pg.eval_on_selector_all("[data-sec]", "e=>e.map(x=>x.dataset.sec)")
            for sec in secs:
                pg.click(f'[data-sec="{sec}"]'); pg.wait_for_timeout(100)
                pg.screenshot(path=f"tools/shots/{sec}-{w}.png", full_page=(w == 1200))
                for i in pg.eval_on_selector_all("#grid [data-open]", "els=>els.map(e=>e.dataset.open)"):
                    pg.click(f'#grid [data-open="{i}"] .nm'); pg.click("#xBtn")
        pg.click('nav.tabs [data-tab="birds"]'); pg.click('[data-sec="bird-local"]')
        pg.click('[data-open="american-robin"]'); pg.fill("#sDate", "09/30/26"); pg.click("#addSight")
        pg.click("#editBtn"); pg.fill("#myText", "test meaning"); pg.fill("#myMonth", "09/26"); pg.click("#saveMeaning")
        pg.screenshot(path=f"tools/shots/detail-{w}.png"); pg.click("#xBtn")
        pg.click('[data-open="red-tailed-hawk"]'); pg.click("#confirmMeaning")
        assert pg.evaluate("state.meanings['red-tailed-hawk'].slice(-1)[0].confirmed===true")
        pg.screenshot(path=f"tools/shots/hawk-{w}.png", full_page=True); pg.click("#xBtn")
        # plant use confirm
        pg.click('nav.tabs [data-tab="greenery"]'); pg.click('[data-sec="green-local"]')
        pg.click('#grid [data-open="rosemary"]'); pg.click('[data-uconfirm="uses"]')
        assert pg.evaluate("state.notes.rosemary.uses.confirmed===true")
        pg.screenshot(path=f"tools/shots/rosemary-{w}.png", full_page=True); pg.click("#xBtn")
        # add a bird with a cover and a real photo
        pg.click('nav.tabs [data-tab="birds"]'); pg.click('[data-sec="bird-local"]')
        pg.click("#addItem"); pg.fill("#niName", "Varied Thrush")
        pg.click('[data-nsize="medium"]'); pg.click('[data-ncolor="orange"]'); pg.click('[data-ncolor="gray"]')
        with pg.expect_file_chooser() as fc: pg.click("#niCover")
        fc.value.set_files(COVER); pg.wait_for_selector("#niCoverPrev img")
        with pg.expect_file_chooser() as fc: pg.click("#niReal")
        fc.value.set_files(REAL); pg.wait_for_selector("#niRealPrev img")
        pg.fill("#niKeys", "hidden song, winter"); pg.click("#niSave"); pg.wait_for_timeout(400)
        cid = pg.evaluate("state.custom.find(c=>c.kind==='bird').id")
        assert pg.evaluate(f"!!(state.photos['{cid}']&&state.photos['{cid}'].cover&&state.photos['{cid}'].a)"), "bird photos not saved"
        # add a flower without photos
        pg.click('nav.tabs [data-tab="flowers"]'); pg.click('[data-sec="flower-local"]')
        pg.click("#addItem"); pg.fill("#niName", "Pink Clover"); pg.click('[data-ncolor="red"]'); pg.click("#niSave"); pg.wait_for_timeout(200)
        pg.click('nav.tabs [data-tab="birds"]')
        pg.click(f'[data-open="{cid}"]'); pg.fill("#sDate", "10/01/26"); pg.click("#pinAfter"); pg.click("#addSight")
        pg.wait_for_selector(".mapbox.placing")
        box = pg.locator("svg.sfmap").bounding_box()
        pg.mouse.click(box["x"] + box["width"] * 0.30, box["y"] + box["height"] * 0.52)
        pg.wait_for_timeout(300)
        assert pg.evaluate("state.sightings.filter(s=>typeof s.lat==='number').length") == 1, "pin not dropped"
        pg.screenshot(path=f"tools/shots/log-{w}.png", full_page=True)
        pg.click('nav.tabs [data-tab="laws"]'); pg.wait_for_timeout(200)
        pg.screenshot(path=f"tools/shots/laws-{w}.png", full_page=True)
        pg.click('nav.tabs [data-tab="settings"]'); pg.screenshot(path=f"tools/shots/settings-{w}.png")
        pg.click('nav.tabs [data-tab="birds"]'); pg.hover("#grid .lb-F >> nth=0"); pg.wait_for_timeout(200)
        pg.screenshot(path=f"tools/shots/badge-{w}.png")
        pg.evaluate("localStorage.clear(); indexedDB.deleteDatabase('kindred-wings')")
        pg.close()
    b.close()
for f in (COVER, REAL): os.remove(f)
print("errors:", errs or "none")
sys.exit(1 if errs else 0)
