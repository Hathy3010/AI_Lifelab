from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, zipfile

root=Path(__file__).resolve().parent
scenes=json.loads((root/'scenes.json').read_text(encoding='utf-8'))
shots=root/'previews'
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18)
heading=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',30)
groups=[('Home','H'),('Student','S'),('Teacher','T')]
archive=root.parent/'AI-LifeLab-22-UI-PNG.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for group,prefix in groups:
        items=[s for s in scenes if s['code'].startswith(prefix)]
        rows=(len(items)+2)//3
        sheet=Image.new('RGB',(1440,100+rows*408),(232,248,241))
        d=ImageDraw.Draw(sheet)
        d.text((24,20),f'AI LifeLab / {group} / {len(items)} UI',font=heading,fill=(33,62,54))
        for i,s in enumerate(items):
            source=shots/(s['code']+'.png')
            with Image.open(source) as im:
                assert im.size==(1440,1080),(s['code'],im.size)
                thumb=im.convert('RGB').resize((456,342),Image.Resampling.LANCZOS)
            x=12+(i%3)*480;y=100+(i//3)*408
            sheet.paste(thumb,(x,y))
            label=s['code']+' · '+s['title']
            while d.textlength(label,font=font)>450:label=label[:-2]
            if label!=s['code']+' · '+s['title']:label+='…'
            d.text((x,y+353),label,font=font,fill=(33,62,54))
            z.write(source,f'{group}/{s["code"]}.png')
        target=shots/('all-'+group.lower()+'.png')
        sheet.save(target)
        z.write(target,f'00-Overview/{group}.png')
    manifest='AI LifeLab · 22 UI/UX images\n1440 × 1080 px each. Illustrative design, not a screenshot of an implemented app.\n\n'
    manifest+='\n'.join(s['code']+' — '+s['title'] for s in scenes)
    z.writestr('Danh-sach-man-hinh.txt',manifest)
print(json.dumps({'archive':str(archive),'images':len(scenes),'groups':{g:sum(s['code'].startswith(p) for s in scenes) for g,p in groups},'size':archive.stat().st_size}))
