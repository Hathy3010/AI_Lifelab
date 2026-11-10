from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,zipfile

root=Path(__file__).resolve().parent
scenes=json.loads((root/'scenes.json').read_text(encoding='utf-8'))
shots=root/'previews'; font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18)
heading=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',28)
archive=root.parent/'AI-LifeLab-Summer-Spring-UI.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for s in scenes:
        group='Mobile' if s['code'].endswith('-M') else 'Tablet' if s['code'].endswith('-T') else s['role']
        image=shots/(s['code']+'.png')
        with Image.open(image) as im:assert im.size==(s['w'],s['h'])
        z.write(image,f'{group}/{image.name}')
    for group in ['Home','Student','Teacher','Mobile','Tablet']:
        items=[s for s in scenes if (s['code'].endswith('-M') if group=='Mobile' else s['code'].endswith('-T') if group=='Tablet' else s['role']==group and '-' not in s['code'])]
        cols=4 if group in ['Mobile','Tablet'] else 3
        tw=360 if cols==4 else 480
        th=720 if group=='Mobile' else 780 if group=='Tablet' else 360
        cell_h=th+55;rows=(len(items)+cols-1)//cols
        board=Image.new('RGB',(tw*cols,90+rows*cell_h),(234,246,248));d=ImageDraw.Draw(board)
        d.text((22,21),f'AI LifeLab / Summer Fresh x Spring Bloom / {group}',font=heading,fill=(23,54,94))
        for i,s in enumerate(items):
            im=Image.open(shots/(s['code']+'.png')).convert('RGB');im.thumbnail((tw-20,th-10),Image.Resampling.LANCZOS)
            x=(i%cols)*tw+10;y=90+(i//cols)*cell_h
            board.paste(im,(x,y));d.text((x,y+th),s['code'],font=font,fill=(23,54,94))
        target=shots/('summer-'+group.lower()+'.png');board.save(target);z.write(target,'Overviews/'+target.name)
    z.write(root/'palette.json','Design-Tokens/palette.json')
    z.write(root/'index.html','Prototype/index.html')
    z.write(root/'SUMMER-README.md','README.md')
    z.writestr('Screen-list.txt','\n'.join(s['code']+' | '+s['title']+' | '+str(s['w'])+'x'+str(s['h']) for s in scenes))
print(json.dumps({'images':len(scenes),'archive':str(archive),'bytes':archive.stat().st_size}))
