from pathlib import Path
from urllib.parse import urlparse,unquote
from playwright.sync_api import sync_playwright
import json

DOCS=Path(__file__).resolve().parent.parent
ROOT=DOCS/'technical'
report={'scope':'Local HTML/SVG rendering and pointer/keyboard probe; no real camera/LLM/database','checks':[]}
def record(name,ok):
    assert ok,name
    report['checks'].append({'name':name,'passed':True})
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1400,'height':1000})
    def serve(route):
        url=route.request.url
        if not url.startswith('http://127.0.0.1:8765/'):
            route.abort();return
        file=(DOCS/unquote(urlparse(url).path.lstrip('/'))).resolve()
        if DOCS not in file.parents or not file.is_file():route.fulfill(status=404,body='missing');return
        mime={'.html':'text/html','.mjs':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.md':'text/plain','.sql':'text/plain'}.get(file.suffix,'text/plain')
        route.fulfill(status=200,body=file.read_bytes(),content_type=mime)
    context.route('**/*',serve)
    page=context.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8765/AI-LifeLab-Thiet-ke-CV-AI-He-thong.html',wait_until='load')
    record('three_diagrams_loaded',page.locator('figure img').count()==3 and page.locator('figure img').evaluate_all('(nodes)=>nodes.every(n=>n.complete&&n.naturalWidth>0)'))
    for i,name in enumerate(['architecture','erd','sequence-8.1']):page.locator('figure img').nth(i).screenshot(path=str(ROOT/(name+'-preview.png')))
    record('document_no_horizontal_overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    for href in page.locator('a[href]').evaluate_all('(nodes)=>nodes.map(n=>n.getAttribute("href"))'):
        if not href.startswith(('https://','http://','#')):record('local_link_'+href,(DOCS/href).is_file())
    page.screenshot(path=str(ROOT/'document-preview.png'))
    page.goto('http://127.0.0.1:8765/technical/cv-probe.html',wait_until='load')
    page.wait_for_function('window.LIFELAB_CV_PROBE!==undefined')
    page.locator('[data-kind="source"][data-id="tank"]').click();page.locator('[data-kind="slot"][data-id="B"]').click()
    record('pointer_places_tank',page.evaluate('JSON.stringify(LIFELAB_CV_PROBE.getSelected())')=='["tank"]')
    page.locator('[data-kind="source"][data-id="pond"]').click();page.locator('[data-kind="slot"][data-id="A"]').click()
    record('wrong_slot_keeps_state',page.evaluate('JSON.stringify(LIFELAB_CV_PROBE.getSelected())')=='["tank"]')
    page.locator('[data-kind="source"][data-id="pond"]').focus();page.keyboard.press('Enter');page.locator('[data-kind="slot"][data-id="C"]').focus();page.keyboard.press('Enter')
    record('keyboard_places_pond',page.evaluate('JSON.stringify(LIFELAB_CV_PROBE.getSelected())')=='["tank","pond"]')
    page.locator('[data-kind="source"][data-id="cistern"]').click();page.locator('[data-kind="slot"][data-id="A"]').click()
    record('budget_prevents_third_facility',page.evaluate('LIFELAB_CV_PROBE.getSelected().length')==2)
    page.locator('#stop').click();record('stop_retains_mouse_controls',page.locator('[data-kind="source"]').count()==3)
    page.locator('#reset').click();record('reset_clears_selection',page.evaluate('LIFELAB_CV_PROBE.getSelected().length')==0)
    page.screenshot(path=str(ROOT/'cv-probe-preview.png'))
    record('no_javascript_errors',not errors)
    browser.close()
(ROOT/'page-check-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'browser_checks':len(report['checks']),'passed':True}))
