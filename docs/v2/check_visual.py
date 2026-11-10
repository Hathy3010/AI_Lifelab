from pathlib import Path
from urllib.parse import urlparse,unquote
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
PREVIEW=ROOT/'previews';PREVIEW.mkdir(exist_ok=True)
print('Starting browser visual check',flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,timeout=20000)
 page=browser.new_page(viewport={'width':1400,'height':1000},device_scale_factor=1)
 def route(req):
  path=(ROOT/unquote(urlparse(req.request.url).path.lstrip('/'))).resolve()
  if ROOT not in path.parents or not path.is_file():req.fulfill(status=404,body='Not found');return
  mime={'.html':'text/html','.svg':'image/svg+xml','.json':'application/json'}.get(path.suffix,'text/plain')
  req.fulfill(status=200,content_type=mime,body=path.read_bytes())
 page.route('http://lifelab.local/**',route)
 page.goto('http://lifelab.local/AI-LifeLab-Phan-tich-Thiet-ke-v2.html',wait_until='load',timeout=20000)
 assert page.locator('figure img').count()==9
 assert page.locator('figure img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(PREVIEW/'document.png'))
 for i,file in enumerate(sorted((ROOT/'diagrams').glob('*.svg'))):
  page.locator('figure img').nth(i).screenshot(path=str(PREVIEW/(file.stem+'.png')),timeout=15000,animations='disabled')
  print('Rendered '+file.stem,flush=True)
 page.goto('http://lifelab.local/database/AI-LifeLab-Database-Toan-du-an.html',wait_until='load',timeout=20000)
 assert page.locator('figure img').count()==3
 assert page.locator('figure img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(PREVIEW/'database-guide.png'))
 browser.close()
(ROOT/'visual-report.json').write_text(json.dumps({'main_images_loaded':9,'database_images_loaded':3,'desktop_no_horizontal_overflow':True,'screenshots':11,'scope':'HTML/SVG browser rendering only; drawio not opened in diagrams.net'},indent=2),encoding='utf-8')
print('Rendered document and nine SVG previews',flush=True)
