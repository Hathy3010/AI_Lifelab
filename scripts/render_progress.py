"""Export PROGRESS.md as an offline reading page. Python standard library only."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'PROGRESS.md'
OUTPUT = ROOT / 'docs' / 'AI-LifeLab-Tien-do.html'


def inline(text):
    text = escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)

    def link(match):
        label, target = match.groups()
        if re.match(r'^(javascript|data):', target, re.I):
            return label
        if not re.match(r'^(https?://|#)', target):
            target = '../' + target
        return f'<a href="{target}">{label}</a>'

    return re.sub(r'\[([^]]+)\]\(([^)]+)\)', link, text)


def sections(markdown):
    result = {}
    title = 'intro'
    result[title] = []
    for line in markdown.splitlines():
        if line.startswith('## '):
            title = line[3:]
            result[title] = []
        else:
            result[title].append(line)
    return result


def table(lines):
    rows = [[part.strip() for part in line.strip('|').split('|')] for line in lines if line.startswith('|')]
    return rows[0], [row for row in rows[1:] if not all(re.fullmatch(r'[:\- ]+', cell) for cell in row)]


def prose(lines):
    return ''.join(f'<p>{inline(line)}</p>' for line in lines if line.strip() and not line.startswith(('|', '# ')))


def steps(lines, name):
    headers, rows = table(lines)
    entries = []
    for index, row in enumerate(rows):
        code, _, title = row[0].partition(' · ')
        entries.append(f'''<details class="step" {'open' if index == 0 else ''}>
          <summary><span class="step-code">{escape(code)}</span><span><small>{escape(name)}</small><strong>{inline(title or row[1])}</strong></span><span class="toggle" aria-hidden="true">+</span></summary>
          <div class="step-body"><section style="grid-column:1/-1"><h4>{inline(headers[1])}</h4><p>{inline(row[1])}</p></section><section><h4>{inline(headers[2])}</h4><p>{inline(row[2])}</p></section><section class="outcome"><h4>{inline(headers[3])}</h4><p>{inline(row[3])}</p></section></div></details>''')
    return ''.join(entries)


def render():
    source = SOURCE.read_text(encoding='utf-8')
    parts = sections(source)
    status_headers, status_rows = table(parts['Trạng thái hiện tại'])
    status = '<div class="status-table"><div class="status-head">' + ''.join(f'<span>{inline(h)}</span>' for h in status_headers) + '</div>'
    for row in status_rows:
        status += '<article class="status-row">' + ''.join(f'<div><small>{inline(status_headers[i])}</small>{inline(cell)}</div>' for i, cell in enumerate(row)) + '</article>'
    status += '</div>'
    history_headers, history_rows = table(parts['Lịch sử thay đổi'])
    history = ''
    for index, row in enumerate(reversed(history_rows)):
        history += f'<details class="history" {"open" if index == 0 else ""}><summary><span class="history-date">{inline(row[0])}</span><strong>{inline(row[1])}</strong><span class="toggle" aria-hidden="true">+</span></summary><dl>'
        history += ''.join(f'<div><dt>{inline(history_headers[i])}</dt><dd>{inline(row[i])}</dd></div>' for i in range(2, len(row))) + '</dl></details>'
    priorities = parts['Ưu tiên thực hiện trước khi viết thêm mã']
    practice = parts['Các bước thực hành tiếp theo']
    update = next(line.strip('*') for line in parts['intro'] if line.startswith('**Cập nhật'))
    css = '''
    :root{--ink:#213e36;--muted:#52685f;--line:#d8e7df;--green:#245c49;--mint:#e8f8f1;--cream:#fff7e6;--sky:#f4faff;--paper:#fcfdf9}
    *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:28px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 'Segoe UI',system-ui,sans-serif}a{color:var(--green);text-underline-offset:4px}button,summary,a{-webkit-tap-highlight-color:transparent}button,summary{cursor:pointer}button{font:inherit}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #387bba;outline-offset:4px}p{max-width:75ch;margin:0 0 18px}h1,h2,h3,h4{line-height:1.3}h1{font-size:clamp(36px,5vw,60px);letter-spacing:-1.6px;margin:12px 0 20px}h2{font-size:30px;letter-spacing:-.6px;margin:0 0 12px}h4{font-size:14px;margin:0 0 10px}code{background:#edf2ec;padding:2px 5px;border-radius:4px;font-size:.88em;overflow-wrap:anywhere}small{font-size:13px;color:var(--muted)}.skip{position:absolute;top:-60px;left:16px;background:var(--cream);padding:12px}.skip:focus{top:12px}.layout{max-width:1500px;margin:auto;padding:24px;display:grid;gap:40px}.sidebar{font-size:14px}.brand{font-weight:750;font-size:20px;text-decoration:none;letter-spacing:-.4px}.brand span{display:inline-grid;place-items:center;background:var(--green);color:var(--mint);width:32px;height:32px;border-radius:8px;margin-right:8px}.side-label,.eyebrow{font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted)}.side-label{margin:28px 0 10px}nav{display:flex;gap:4px;flex-wrap:wrap}nav a{display:block;padding:8px 12px;border-radius:6px;text-decoration:none}nav a:hover,nav a[aria-current]{background:var(--mint)}.side-note{display:none}.content{min-width:0}.hero{padding:24px 0 32px;border-bottom:1px solid var(--line)}.hero .lead{font-size:19px;max-width:58ch}.updated{font-size:13px;color:var(--muted);max-width:80ch}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0 0}.button{display:inline-block;padding:10px 16px;border-radius:7px;border:1px solid var(--line);background:var(--paper);color:var(--ink);text-decoration:none;font-size:14px;font-weight:600}.button:hover{background:var(--mint)}.primary{background:var(--green);color:var(--mint);border-color:var(--green)}.primary:hover{background:#1c493a}.now{background:var(--cream);padding:24px;margin:28px 0;display:grid;gap:16px;border-radius:10px}.now h3{font-size:22px;margin:4px 0 8px}.now p{margin:0}.route{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;margin-top:18px}.route span{padding:5px 10px;background:#fffdf5;border:1px solid #e8deca;border-radius:5px}.section{padding:38px 0;border-bottom:1px solid var(--line)}.section-top{display:flex;align-items:start;justify-content:space-between;gap:16px;margin-bottom:24px}.section-intro{color:var(--muted);max-width:70ch}.section-number{font-size:13px;color:var(--green);font-weight:700;display:block;margin-bottom:10px}.section-prose>p{margin-top:22px}.status-head{display:none}.status-row{padding:20px 0;border-top:1px solid var(--line);display:grid;gap:12px;font-size:14px}.status-row div:first-child{font-weight:700;font-size:16px}.status-row small{display:block;margin-bottom:2px;font-size:11px;font-weight:400}.step{border-top:1px solid var(--line)}summary{list-style:none}summary::-webkit-details-marker{display:none}.step summary{display:grid;grid-template-columns:40px minmax(0,1fr) 20px;gap:14px;align-items:start;padding:22px 0}.step-code{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--mint);font-weight:700;font-size:14px}.step summary strong{display:block;font-size:17px;line-height:1.6;max-width:70ch}.step summary small{display:block;margin-bottom:6px}.toggle{font-size:24px;line-height:1.4;font-weight:300;color:var(--green)}details[open]>summary .toggle{transform:rotate(45deg)}.step-body{padding:0 0 24px 54px;display:grid;gap:16px;font-size:15px}.step-body p{margin:0}.outcome{padding:20px;background:var(--sky);border-radius:8px}.history{border-top:1px solid var(--line)}.history summary{display:grid;gap:8px;grid-template-columns:minmax(0,1fr) 20px;padding:20px 0;align-items:start}.history-date{font-size:12px;color:var(--muted);grid-column:1/-1}.history summary strong{font-size:17px}.history dl{margin:0 0 24px;display:grid;gap:16px}.history dl div{display:grid;gap:4px;font-size:14px}.history dt{font-size:12px;color:var(--muted);font-weight:600}.history dd{margin:0;max-width:75ch}.notes{font-size:14px;padding:28px;background:var(--mint);border-radius:10px}.notes p:last-child{margin:0}footer{padding:28px 0;color:var(--muted);font-size:13px}button:disabled{opacity:.6}summary:hover strong{color:var(--green)}
    @media(min-width:800px){.layout{grid-template-columns:210px minmax(0,1fr);gap:56px;padding:36px 40px}.sidebar{position:sticky;top:32px;align-self:start}nav{display:block}.side-note{display:block;border-top:1px solid var(--line);margin-top:28px;padding-top:18px;font-size:12px;color:var(--muted)}.status-head,.status-row{display:grid;grid-template-columns:1fr 1.7fr 1.5fr;gap:24px}.status-head{font-size:12px;font-weight:600;color:var(--muted);padding-bottom:12px}.status-row small{display:none}.status-row div:first-child{font-size:14px}.history dl div{grid-template-columns:160px minmax(0,1fr);gap:24px}.history summary{grid-template-columns:160px minmax(0,1fr) 20px;gap:24px}.history-date{grid-column:auto}.step-body{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.now{grid-template-columns:minmax(0,1fr) auto;align-items:center}.hero{padding-top:20px}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
    @media print{html{scroll-behavior:auto}.layout{display:block;padding:0}.sidebar,.actions,.section-top button,.skip,.now .button{display:none}.section{padding:20px 0}.step-body{padding-left:0}body{font-size:11px}h1{font-size:28px}h2{font-size:20px}summary{break-after:avoid}details{break-inside:auto}a{color:inherit}.notes{background:none;padding:0}footer{font-size:10px}}
    '''
    html = f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI LifeLab · Tiến độ & lộ trình học</title><style>{css}</style></head><body>
    <a class="skip" href="#main">Bỏ qua mục lục</a><div class="layout"><aside class="sidebar"><a href="#main" class="brand"><span aria-hidden="true">L</span>AI LifeLab</a><p class="side-label">Sổ tay dự án</p><nav aria-label="Mục lục"><a href="#overview">01 · Đang ở đâu?</a><a href="#priorities">02 · Làm gì trước?</a><a href="#practice">03 · Thực hành tiếp</a><a href="#history">04 · Đã thay đổi gì?</a><a href="#updates">Cách cập nhật</a></nav><p class="side-note">Đọc theo thứ tự.<br>Hiểu một luồng, tự làm một phần nhỏ, rồi kiểm chứng.</p></aside>
    <main id="main" class="content"><header class="hero"><span class="eyebrow">Tiến độ & lộ trình học</span><h1>Xây LifeLab.<br>Hiểu từng bước.</h1><p class="lead">Biết dự án đang ở đâu, việc nào cần làm trước và kiến thức cần ôn khi bắt tay vào mã.</p><p class="updated">{inline(update)}</p><div class="actions"><a class="button primary" href="#priorities">Bắt đầu từ việc ưu tiên ↓</a><button class="button" id="print">In / lưu PDF</button><a class="button" href="../PROGRESS.md">Tài liệu nguồn ↗</a></div></header>
    <div class="now"><div><span class="eyebrow">Việc nên làm ngay</span><h3>Tự chạy và lần theo một lần thử.</h3><p>U1 → U2: mở frontend/backend, bấm “Chạy thử và lưu”, rồi chỉ ra dữ liệu đã đi qua những file nào.</p><div class="route" aria-label="Luồng học"><span>Chạy được</span>→<span>Hiểu luồng</span>→<span>Tự sửa</span>→<span>Kiểm chứng</span></div></div><a class="button" href="#priorities">Xem cách thực hiện</a></div>
    <section id="overview" class="section"><span class="section-number">01 / Trạng thái hiện tại</span><h2>Đang ở đâu?</h2><p class="section-intro">Hai bài cân đã có luồng kết nối. Database, tài khoản và nghiệm thu AI/CV thật vẫn còn ở phía trước.</p>{status}</section>
    <section id="priorities" class="section"><div class="section-top"><div><span class="section-number">02 / Chuẩn bị trước khi sửa mã</span><h2>Làm gì trước?</h2><p class="section-intro">Năm bước ưu tiên. Mở từng bước để xem kiến thức cần ôn và điều kiện chuyển tiếp.</p></div><button class="button expand" aria-expanded="false">Mở tất cả</button></div>{steps(priorities,'Ưu tiên')}<div class="section-prose">{prose(priorities)}</div></section>
    <section id="practice" class="section"><div class="section-top"><div><span class="section-number">03 / Học đến đâu, thực hành đến đó</span><h2>Thực hành tiếp theo</h2><p class="section-intro">Bám theo mã đã có. Mỗi đợt chọn một phần nhỏ, làm xong rồi ghi nhận.</p></div><button class="button expand" aria-expanded="false">Mở tất cả</button></div>{steps(practice,'Thực hành')}<div class="section-prose">{prose(practice)}</div></section>
    <section id="history" class="section"><div class="section-top"><div><span class="section-number">04 / Nhật ký thay đổi</span><h2>Đã thay đổi gì?</h2><p class="section-intro">Mới nhất ở trên. Mở từng mốc để đọc cách làm, lý do, kiểm chứng và phần tiếp theo.</p></div><button class="button expand" aria-expanded="false">Mở tất cả</button></div>{history}<div class="section-prose">{prose(parts['Lịch sử thay đổi'])}</div></section>
    <section id="updates" class="section"><h2>Cập nhật một lần, đọc cùng một nguồn.</h2><div class="notes">{prose(parts['Cách cập nhật tiết kiệm tài nguyên'])}<p>Bản web được xuất từ <code>PROGRESS.md</code>. Sau khi cập nhật nguồn, chạy <code>python scripts/render_progress.py</code> tại gốc workspace rồi tải lại trang. Không cần server, thư viện bổ sung hoặc tác vụ nền.</p></div></section>
    <footer>AI LifeLab · Tài liệu tiến độ nội bộ · Bản xuất tĩnh, không gửi dữ liệu ra ngoài.</footer></main></div>
    <script>
    document.querySelectorAll('.expand').forEach(button=>button.addEventListener('click',()=>{{const open=button.getAttribute('aria-expanded')!=='true';button.closest('section').querySelectorAll('details').forEach(item=>item.open=open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'Thu gọn':'Mở tất cả';}}));
    let saved=[];window.addEventListener('beforeprint',()=>{{saved=[...document.querySelectorAll('details')].map(item=>[item,item.open]);saved.forEach(([item])=>item.open=true);}});window.addEventListener('afterprint',()=>saved.forEach(([item,open])=>item.open=open));document.querySelector('#print').addEventListener('click',()=>window.print());
    const nav=[...document.querySelectorAll('nav a')];if('IntersectionObserver' in window){{new IntersectionObserver(entries=>{{entries.forEach(entry=>{{if(entry.isIntersecting){{nav.forEach(a=>a.removeAttribute('aria-current'));nav.find(a=>a.hash==='#'+entry.target.id)?.setAttribute('aria-current','location');}}}});}},{{rootMargin:'-5% 0px -65% 0px'}}).observe(document.querySelector('#overview'));document.querySelectorAll('main>section').forEach(section=>{{new IntersectionObserver(entries=>{{if(entries[0].isIntersecting){{nav.forEach(a=>a.removeAttribute('aria-current'));nav.find(a=>a.hash==='#'+section.id)?.setAttribute('aria-current','location');}}}},{{rootMargin:'-5% 0px -65% 0px'}}).observe(section);}});}}
    </script></body></html>'''
    OUTPUT.write_text(html, encoding='utf-8')
    print(f'Exported {OUTPUT} ({len(history_rows)} history entries)')


if __name__ == '__main__':
    render()
