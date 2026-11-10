from pathlib import Path
from html import escape
import re
import sys

root=Path(__file__).resolve().parent
source=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'AI-LifeLab-Dac-ta-MVP.md'
lines=source.read_text(encoding='utf-8').splitlines()
def inline(s):
    safe=escape(s)
    safe=re.sub(r'\[([^\]]+)\]\((https://[^\s)]+|[A-Za-z0-9_./-]+\.(?:html|json|sql|md|mjs|svg|zip)(?:#[\w-]+)?)\)',r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>',safe)
    safe=re.sub(r'`([^`]+)`',r'<code>\1</code>',safe)
    return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',safe)
out=[];nav=[];i=0;section=0;tables=0
while i<len(lines):
    s=lines[i].strip()
    if not s:i+=1;continue
    picture=re.fullmatch(r'!\[([^\]]*)\]\(([A-Za-z0-9_./-]+\.(?:svg|png))\)',s)
    if picture:
        out.append('<figure><img src="'+escape(picture[2],quote=True)+'" alt="'+escape(picture[1],quote=True)+'"><figcaption>'+escape(picture[1])+'</figcaption></figure>');i+=1;continue
    if s.startswith('```'):
        code=[];i+=1
        while i<len(lines) and not lines[i].strip().startswith('```'):
            code.append(lines[i]);i+=1
        out.append('<pre><code>'+escape('\n'.join(code))+'</code></pre>');i+=1;continue
    if s.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            row=[x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?',x) for x in row):rows.append(row)
            i+=1
        out.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+inline(x)+'</th>' for x in rows[0])+'</tr></thead><tbody>')
        for row in rows[1:]:out.append('<tr>'+''.join('<td>'+inline(x)+'</td>' for x in row)+'</tr>')
        out.append('</tbody></table></div>');tables+=1;continue
    if s.startswith('### '):out.append('<h3>'+inline(s[4:])+'</h3>')
    elif s.startswith('## '):
        section+=1;label=s[3:];nav.append((section,label));out.append(f'<h2 id="s{section}">'+inline(label)+'</h2>')
    elif s.startswith('# '):out.append('<h1>'+inline(s[2:])+'</h1>')
    else:out.append('<p>'+inline(s)+'</p>')
    i+=1
css='''body{margin:0;background:#f3f7fa;color:#18374e;font-family:"Segoe UI",Arial,sans-serif;font-size:16px;line-height:1.65}main{max-width:1100px;margin:auto;padding:48px 36px 90px}h1{font-size:34px;line-height:1.25;margin-bottom:28px}h2{font-size:25px;margin-top:60px;padding-top:20px;border-top:1px solid #ccdce7;scroll-margin-top:20px}h3{font-size:18px;margin:30px 0 14px}p{max-width:95ch}.table-wrap{overflow-x:auto;margin:18px 0 26px}table{width:100%;border-collapse:collapse;background:#fcfefd;font-size:15px}th{background:#e4eef7;text-align:left;font-weight:600}th,td{padding:14px 16px;border:1px solid #d4e0e8;vertical-align:top}tbody tr:nth-child(even){background:#f0f6f8}td:first-child{min-width:120px}nav{background:#e8f3ee;padding:20px 24px;border-radius:12px;margin:32px 0}nav span{display:block;font-weight:600;margin-bottom:10px}nav a{display:inline-block;color:#245a78;text-decoration:none;margin:4px 18px 4px 0;font-size:14px}a:hover{text-decoration:underline}strong{font-weight:650}@media(max-width:700px){main{padding:24px 16px}h1{font-size:28px}th,td{padding:10px;font-size:14px}}@media print{body{background:#fff}main{max-width:none;padding:0}nav{display:none}h2,h3{break-after:avoid}tr{break-inside:avoid}table{font-size:11px}th,td{padding:7px}}'''
css+='pre{background:#e8eff5;border:1px solid #ccdce7;padding:20px;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font-size:14px}code{font-family:Consolas,monospace}a{color:#245a78}'
css+='figure{margin:24px 0;overflow-x:auto}figure img{width:100%;min-width:640px;height:auto;border:1px solid #ccdce7;border-radius:12px}figcaption{font-size:13px;color:#526d80;margin-top:8px}'
page_title=lines[0].lstrip('# ').strip()
html='<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(page_title)+'</title><style>'+css+'</style><main>'
html+='<nav aria-label="Mục lục"><span>Đi nhanh đến nội dung</span>'+''.join(f'<a href="#s{n}">'+escape(label)+'</a>' for n,label in nav)+'</nav>'
html+=''.join(out)+'</main></html>'
source.with_suffix('.html').write_text(html,encoding='utf-8')

# Independently verify the numerical examples before delivering the specification.
series={'A':[30,40,55,65,75,85],'B':[30,55,60,40,35,30]}
expected={50:(3,2),60:(4,None),70:(5,None),80:(None,None)}
for threshold,wanted in expected.items():
    actual=tuple(next((i for i in range(1,len(data)) if data[i-1]>=threshold and data[i]>=threshold),None) for data in series.values())
    assert actual==wanted,(threshold,actual,wanted)
rain_volume=50/1000*1000
assert rain_volume==50 and 5*2*1==10 and 5*2*2==20 and 5*3*2==30
assert sum([40,50])==90 and min(rain_volume,20+30)==50 and max(0,rain_volume-20-30)==0
assert sum([30,40])==70 and min(rain_volume,10+20)==30 and max(0,rain_volume-10-20)==20
assert sum([100000,50000,30000,40000,60000])==280000
energy=lambda h:sum(p*q*t/1000 for p,q,t in zip([20,50,100],[10,4,5],h))
assert abs(energy([6,6,2])-3.4)<1e-9 and round(energy([6,6,2])*2500)==8500
assert abs(energy([4,4,1])-2.1)<1e-9 and round(energy([4,4,1])*2500)==5250
assert (900000-300000)//100000==6 and 300000+150000-400000==50000
assert sum([30,30,45])==105
assert len(re.findall(r'\| KT-\d+',(root/'AI-LifeLab-Dac-ta-MVP.md').read_text(encoding='utf-8')))==16
print(f'Exported {source.with_suffix(".html").name}: {tables} tables; numerical reference examples checked.')
