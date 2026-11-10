from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageDraw

root=Path(__file__).resolve().parent
shots=root/'previews';shots.mkdir(exist_ok=True)
report={'screens':[],'issues':[],'navigation':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1080},device_scale_factor=1)
    # Local review must also work without Google Fonts or network access.
    context.route('https://fonts.googleapis.com/**',lambda route: route.abort())
    context.route('https://fonts.gstatic.com/**',lambda route: route.abort())
    page=context.new_page()
    page.goto((root/'index.html').as_uri()+'?capture#H01',wait_until='domcontentloaded')
    specs=page.evaluate('window.LIFELAB_SCENES.map(s=>({code:s.code,title:s.title,w:s.w,h:s.h}))')
    for spec in specs:
        page.set_viewport_size({'width':spec['w'],'height':spec['h']})
        page.evaluate('(code)=>location.hash=code',spec['code'])
        page.wait_for_timeout(70)
        issues=page.evaluate('''()=>[...document.querySelectorAll('.screen .txt,.screen .button,.screen .link,.screen .input')].filter(n=>{const r=n.getBoundingClientRect();return r.right>activeScene.w+1||r.bottom>activeScene.h+1||r.left<0||r.top<0}).map(n=>({text:n.textContent||n.value,bounds:JSON.stringify(n.getBoundingClientRect())}))''')
        if issues:report['issues'].append({'screen':spec['code'],'issues':issues})
        page.screenshot(path=str(shots/(spec['code']+'.png')),full_page=False)
        report['screens'].append(spec)
    # Check important routes via real browser clicks.
    page.set_viewport_size({'width':1440,'height':1080})
    for start,label,target in [('H01','Vào LifeLab →','S01'),('S01','Tiếp tục trải nghiệm →','S08'),('S08','Chạy thử mô phỏng →','S09'),('S09','Nhìn lại trải nghiệm →','S10'),('S10','Lưu & hoàn thành →','S11'),('T03','Khám phá →','T04'),('T04','Chọn để giao →','T05'),('T05','Tiếp tục xem lại →','T06'),('T06','Giao cho lớp 8A →','T07'),('T08','Lưu góp ý','T07'),('S08-M','Chạy thử mô phỏng →','S09-M'),('S09-M','Nhìn lại trải nghiệm →','S10-M'),('S08-T','Chạy thử mô phỏng →','S09-T'),('S10-T','Lưu & hoàn thành →','S04-T')]:
        page.evaluate('(code)=>location.hash=code',start);page.wait_for_timeout(40)
        dims=page.evaluate('({width:activeScene.w,height:activeScene.h})');page.set_viewport_size(dims)
        page.get_by_role('link',name=label,exact=True).first.click()
        page.wait_for_timeout(40)
        actual=page.evaluate('location.hash.slice(1)')
        assert actual==target,(start,label,target,actual)
        report['navigation'].append({'from':start,'to':target,'pass':True})
    page.set_viewport_size({'width':1440,'height':1080});page.evaluate("location.hash='S10'");page.wait_for_timeout(50)
    field=page.locator('[data-field="reflection1"]');field.fill('Mình nhận ra vai trò của thanh giằng.');page.reload(wait_until='domcontentloaded')
    assert page.locator('[data-field="reflection1"]').input_value()=='Mình nhận ra vai trò của thanh giằng.'
    report['reflectionPersistence']=True
    page.goto((root/'index.html').as_uri()+'#S08',wait_until='domcontentloaded')
    page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='domcontentloaded')
    assert page.evaluate('activeScene.code')=='S08-M'
    report['mobileReflow']=True
    browser.close()

thumb_w=480;thumb_h=360
for name,codes in [('overview',['H01','S01','T01','S06','S08','T05']),('student',['S01','S02','S05','S06','S08','S10']),('teacher',['T01','T02','T03','T05','T06','T07'])]:
    canvas=Image.new('RGB',(thumb_w*3,thumb_h*2+64),(220,230,224))
    d=ImageDraw.Draw(canvas);d.text((20,18),'AI LifeLab | '+name+' | UI Preview',fill=(33,62,54))
    for i,code in enumerate(codes):
        im=Image.open(shots/(code+'.png')).convert('RGB').resize((thumb_w,thumb_h))
        canvas.paste(im,((i%3)*thumb_w,64+(i//3)*thumb_h))
    canvas.save(shots/(name+'.png'))
(root/'qa-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'screens':len(report['screens']),'issues':report['issues'],'navigation':len(report['navigation']),'reflectionPersistence':report['reflectionPersistence']},ensure_ascii=True))
