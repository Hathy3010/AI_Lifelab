"""Create native editable diagrams.net user flows and matching SVG previews."""
from pathlib import Path
import xml.etree.ElementTree as E
from html import escape
import textwrap

OUT = Path(__file__).resolve().parents[1]
COLORS = {'action': ('#F4FAFF', '#6897BC'), 'decision': ('#FFF7E6', '#C49843'),
          'terminal': ('#E8F8F1', '#4C9477'), 'error': ('#FFF0ED', '#C67E70'),
          'note': ('#FFFFFF', '#B2BCC8')}

class Flow:
    def __init__(self, name, slug, height):
        self.name, self.slug, self.height = name, slug, height
        self.nodes, self.edges = {}, []
    def node(self, key, text, x, y, kind='action', w=280, h=64):
        self.nodes[key] = (text, x, y, w, h, kind)
    def edge(self, a, b, label='', source='bottom', target='top', via=()):
        self.edges.append((a, b, label, source, target, via))
    def anchor(self, key, side):
        _, x, y, w, h, _ = self.nodes[key]
        return {'top': (x+w/2,y), 'bottom':(x+w/2,y+h),
                'left':(x,y+h/2), 'right':(x+w,y+h/2)}[side]

s = Flow('01 · Học sinh trải nghiệm', 'Hoc-sinh', 2500)
for args in [
 ('start','Bắt đầu',440,130,'terminal'),
 ('login','Đăng nhập bằng tài khoản học sinh',440,240),
 ('pick','Chọn bài từ thư viện hoặc nhiệm vụ được giao',440,350),
 ('resume','Có phiên đang làm?',440,460,'decision',280,100),
 ('intro','Đọc bối cảnh, nhiệm vụ và mục tiêu',440,630),
 ('open','Bắt đầu phiên mới',440,740),
 ('restore','Tiếp tục phiên và khôi phục tiến trình đã lưu',850,478),
 ('input','Đưa ra lựa chọn / thao tác mô phỏng',440,880),
 ('run','Nhấn Chạy mô phỏng',440,1010),
 ('valid','Lựa chọn hợp lệ?',440,1120,'decision',280,100),
 ('invalid','Xem lỗi và điều chỉnh lựa chọn',55,1138,'error'),
 ('save','Tính kết quả và lưu lượt thử',440,1320),
 ('saved','Lưu thành công?',440,1430,'decision',280,100),
 ('network','Báo chưa lưu; giữ dữ liệu tạm. Kết nối lại và gửi lại cùng mã yêu cầu',850,1448,'error',280,100),
 ('result','Xem kết quả và so sánh các lượt thử',440,1630),
 ('retry','Muốn thử phương án khác?',440,1740,'decision',280,100),
 ('ready','Đủ điều kiện hoàn thành?',440,1900,'decision',280,100),
 ('missing','Xem yêu cầu còn thiếu và tiếp tục thực hiện',850,1918,'error'),
 ('reflect','Chọn lượt thử cuối và viết phản tư',440,2060),
 ('complete','Gửi hoàn thành; lưu phản tư và bằng chứng',440,2170),
 ('profile','Xem kết quả tổng kết và tiến trình cá nhân',440,2280),
 ('finish','Kết thúc',440,2390,'terminal'),
 ('coach','AI Coach (tùy chọn): gợi ý hoặc đặt câu hỏi; lỗi AI dùng gợi ý có sẵn',850,1030,'note',280,110),
 ('camera','Bài 8.2: có thể dùng camera. Từ chối quyền hoặc nhận dạng sai → dùng chuột / bàn phím.',55,720,'note',280,110),
 ('exit','Thoát giữa chừng: chỉ báo Đã lưu khi máy chủ xác nhận. Khi quay lại, tiếp tục từ bản đã lưu.',55,1500,'note',280,120),
 ('legend','Cách đọc: xanh nhạt = bước thao tác; vàng = câu hỏi; xanh lá = bắt đầu / kết thúc; đỏ nhạt = lỗi cần xử lý.',55,2060,'note',280,130),
]: s.node(*args)
s.edge('start','login'); s.edge('login','pick'); s.edge('pick','resume')
s.edge('resume','intro','Không'); s.edge('intro','open'); s.edge('open','input')
s.edge('resume','restore','Có','right','left')
s.edge('restore','input','','bottom','right',[(990,912)])
s.edge('input','run'); s.edge('run','valid')
s.edge('valid','invalid','Không','left','right')
s.edge('invalid','input','','top','left',[(195,912)])
s.edge('valid','save','Có'); s.edge('save','saved')
s.edge('saved','network','Không','right','left')
s.edge('network','save','Thử lại','top','right',[(990,1352)])
s.edge('saved','result','Có'); s.edge('result','retry')
s.edge('retry','input','Có','left','left',[(370,1790),(370,912)])
s.edge('retry','ready','Không'); s.edge('ready','missing','Chưa','right','left')
s.edge('missing','input','','right','right',[(1190,1950),(1190,912)])
s.edge('ready','reflect','Đủ'); s.edge('reflect','complete'); s.edge('complete','profile'); s.edge('profile','finish')

t = Flow('02 · Giáo viên giao và theo dõi nhiệm vụ', 'Giao-vien', 1970)
for args in [
 ('start','Bắt đầu',440,130,'terminal'),
 ('login','Đăng nhập bằng tài khoản giáo viên',440,240),
 ('dash','Mở bảng điều khiển giáo viên',440,350),
 ('class','Chọn lớp được phân công quản lý',440,460),
 ('library','Chọn kịch bản có sẵn trong thư viện',440,570),
 ('preview','Xem mục tiêu, yêu cầu và xem trước trải nghiệm',440,680),
 ('setup','Nhập hướng dẫn, mục tiêu và thời hạn giao bài',440,790),
 ('check','Thông tin giao bài hợp lệ?',440,900,'decision',280,100),
 ('fix','Xem lỗi và điều chỉnh thông tin',55,918,'error'),
 ('assign','Xác nhận giao bài cho lớp',440,1080),
 ('saved','Giao bài thành công?',440,1190,'decision',280,100),
 ('error','Báo lỗi; giữ nội dung. Thử gửi lại cùng mã yêu cầu để tránh giao trùng.',850,1208,'error',280,110),
 ('monitor','Xem danh sách nhận bài và tiến độ tham gia / hoàn thành',440,1400),
 ('detail','Chọn học sinh để xem lượt thử, phản tư và bằng chứng',440,1510),
 ('review','Ghi nhận xét của giáo viên; xem xét đề xuất nhận xét từ AI nếu có',440,1620),
 ('back','Quay lại theo dõi lớp',440,1730),
 ('finish','Kết thúc lượt làm việc',440,1840,'terminal'),
 ('scope','Phạm vi MVP: chọn kịch bản có sẵn và giao nhiệm vụ; chưa có công cụ tạo kịch bản nâng cao.',850,570,'note',280,110),
 ('privacy','Giáo viên chỉ xem các lớp và học sinh thuộc phạm vi được phép. Nhận xét giáo viên không ghi đè bài làm.',55,1430,'note',280,130),
]: t.node(*args)
for a,b in [('start','login'),('login','dash'),('dash','class'),('class','library'),('library','preview'),('preview','setup'),('setup','check')]:t.edge(a,b)
t.edge('check','fix','Không','left','right');t.edge('fix','setup','','top','left',[(195,822)])
t.edge('check','assign','Có');t.edge('assign','saved')
t.edge('saved','error','Không','right','left');t.edge('error','assign','Thử lại','top','right',[(990,1112)])
t.edge('saved','monitor','Có')
for a,b in [('monitor','detail'),('detail','review'),('review','back'),('back','finish')]:t.edge(a,b)

g = Flow('03 · Giám sát học sinh (giáo viên)', 'Giam-sat', 2540)
for args in [
 ('start','Bắt đầu giám sát',440,130,'terminal'),
 ('login','Đăng nhập bằng tài khoản giáo viên',440,240),
 ('class','Chọn lớp và nhiệm vụ đã giao',440,350),
 ('access','Có quyền xem lớp?',440,460,'decision',280,100),
 ('denied','Thông báo không có quyền; quay lại chọn lớp',55,478,'error',280,80),
 ('overview','Xem số học sinh tham gia, hoàn thành và tiến độ theo bài',440,640),
 ('choose','Chọn học sinh để xem chi tiết',440,750),
 ('data','Đã có phiên trải nghiệm?',440,860,'decision',280,100),
 ('empty','Hiển thị Chưa bắt đầu; chưa có dữ liệu để nhận xét',850,878,'note',280,90),
 ('session','Xem trạng thái phiên và các lượt thử đã lưu',440,1050),
 ('done','Đã hoàn thành bài?',440,1160,'decision',280,100),
 ('progress','Xem lựa chọn và kết quả hiện có; nhận diện vướng mắc từ dữ liệu',55,1178,'action',280,100),
 ('evidence','Đọc phản tư, lượt thử được chọn và bằng chứng học tập',440,1350),
 ('ai','Có đề xuất nhận xét AI?',440,1460,'decision',280,100),
 ('suggestion','Đối chiếu đề xuất AI với dữ liệu nguồn; giáo viên tự nhận định',850,1478,'action',280,100),
 ('review','Viết nhận xét dựa trên dữ liệu; hướng dẫn bước tiếp theo',440,1670,'action',280,85),
 ('save','Lưu nhận xét của giáo viên',440,1830),
 ('saved','Lưu thành công?',440,1940,'decision',280,100),
 ('error','Báo lỗi, giữ bản nháp; thử lại cùng mã yêu cầu',850,1958,'error',280,90),
 ('shown','Hiển thị nhận xét đã lưu trong hồ sơ phiên',440,2130),
 ('more','Xem học sinh khác?',440,2240,'decision',280,100),
 ('finish','Kết thúc giám sát',440,2430,'terminal'),
 ('scope','Người giám sát trong MVP là giáo viên phụ trách lớp; chưa thêm vai trò quản trị riêng.',850,290,'note',280,110),
 ('limits','Chỉ theo dõi tiến trình đã gửi về máy chủ; không xem camera, video hay màn hình trực tiếp của học sinh.',55,680,'note',280,120),
 ('rules','Nhận xét không sửa bài làm hoặc kết quả mô phỏng. Đề xuất AI là hỗ trợ, không tự kết luận năng lực.',55,1900,'note',280,120),
]: g.node(*args)
for a,b in [('start','login'),('login','class'),('class','access')]:g.edge(a,b)
g.edge('access','denied','Không','left','right')
g.edge('denied','class','','top','left',[(195,382)])
g.edge('access','overview','Có');g.edge('overview','choose');g.edge('choose','data')
g.edge('data','empty','Chưa','right','left')
g.edge('empty','more','','right','right',[(1200,923),(1200,2290)])
g.edge('data','session','Có');g.edge('session','done')
g.edge('done','progress','Chưa','left','right')
g.edge('progress','review','','bottom','left',[(195,1712)])
g.edge('done','evidence','Rồi');g.edge('evidence','ai')
g.edge('ai','suggestion','Có','right','left')
g.edge('suggestion','review','','bottom','right',[(990,1712)])
g.edge('ai','review','Không');g.edge('review','save');g.edge('save','saved')
g.edge('saved','error','Không','right','left')
g.edge('error','save','Thử lại','top','right',[(990,1862)])
g.edge('saved','shown','Có');g.edge('shown','more')
g.edge('more','choose','Có','left','left',[(365,2290),(365,782)])
g.edge('more','finish','Không')

root = E.Element('mxfile', host='app.diagrams.net', type='device', version='24.7.17')
anchors={'top':(.5,0),'bottom':(.5,1),'left':(0,.5),'right':(1,.5)}
for flow in (s,t,g):
    diagram=E.SubElement(root,'diagram',id=flow.slug,name=flow.name)
    model=E.SubElement(diagram,'mxGraphModel',dx='1250',dy='900',grid='1',gridSize='10',guides='1',tooltips='1',connect='1',arrows='1',fold='1',page='1',pageScale='1',pageWidth='1250',pageHeight=str(flow.height),math='0',shadow='0')
    cells=E.SubElement(model,'root');E.SubElement(cells,'mxCell',id='0');E.SubElement(cells,'mxCell',id='1',parent='0')
    title=E.SubElement(cells,'mxCell',id='title',value='AI LifeLab · '+flow.name,style='text;html=0;fontSize=25;fontStyle=1;fontColor=#17354A;align=left;verticalAlign=middle;',vertex='1',parent='1')
    E.SubElement(title,'mxGeometry',x='55',y='30',width='1120',height='55',attrib={'as':'geometry'})
    for key,(text,x,y,w,h,kind) in flow.nodes.items():
        fill,stroke=COLORS[kind]
        shape='rhombus;' if kind=='decision' else 'rounded=1;arcSize=25;'
        if kind=='terminal':shape='ellipse;'
        style=shape+f'whiteSpace=wrap;html=0;fillColor={fill};strokeColor={stroke};fontColor=#17354A;fontSize=15;fontFamily=Arial;spacing=12;strokeWidth=1.5;'
        if kind=='note':style+='dashed=1;'
        node=E.SubElement(cells,'mxCell',id=key,value=text,style=style,vertex='1',parent='1')
        E.SubElement(node,'mxGeometry',x=str(x),y=str(y),width=str(w),height=str(h),attrib={'as':'geometry'})
    for i,(a,b,label,src,dst,via) in enumerate(flow.edges):
        ex,ey=anchors[src];ix,iy=anchors[dst]
        edge=E.SubElement(cells,'mxCell',id=f'edge{i}',value=label,style=f'edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endArrow=block;endFill=1;strokeColor=#627B90;strokeWidth=1.5;fontSize=14;fontColor=#17354A;labelBackgroundColor=#FFFFFF;exitX={ex};exitY={ey};exitDx=0;exitDy=0;entryX={ix};entryY={iy};entryDx=0;entryDy=0;',edge='1',parent='1',source=a,target=b)
        geo=E.SubElement(edge,'mxGeometry',relative='1',attrib={'as':'geometry'})
        if via:
            arr=E.SubElement(geo,'Array',attrib={'as':'points'})
            for x,y in via:E.SubElement(arr,'mxPoint',x=str(x),y=str(y))
    # Standalone SVG preview uses the same shapes and explicit connector paths.
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="{flow.height}" viewBox="0 0 1250 {flow.height}">',
         '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#627B90"/></marker></defs>',
         '<rect width="100%" height="100%" fill="white"/>',
         f'<text x="55" y="66" font-size="25" font-weight="700" fill="#17354A" font-family="Arial,sans-serif">AI LifeLab · {escape(flow.name)}</text>',
         '<text x="55" y="100" font-size="14" fill="#627B90" font-family="Arial,sans-serif">Luồng người dùng MVP · Sơ đồ đề xuất theo đặc tả · Các khung nét đứt là ghi chú</text>']
    for a,b,label,src,dst,via in flow.edges:
        p=flow.anchor(a,src);q=flow.anchor(b,dst);pts=[p,*via,q]
        svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="none" stroke="#627B90" stroke-width="1.5" marker-end="url(#arrow)"/>')
        if label:
            mx,my=(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2
            svg.append(f'<rect x="{mx-32}" y="{my-12}" width="64" height="24" fill="white"/><text x="{mx}" y="{my+5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#17354A">{escape(label)}</text>')
    for text,x,y,w,h,kind in flow.nodes.values():
        fill,stroke=COLORS[kind]
        attr=f'fill="{fill}" stroke="{stroke}" stroke-width="1.5"'
        if kind=='decision':svg.append(f'<polygon points="{x+w/2},{y} {x+w},{y+h/2} {x+w/2},{y+h} {x},{y+h/2}" {attr}/>')
        elif kind=='terminal':svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" {attr}/>')
        else:svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" {attr} '+('stroke-dasharray="6 4"' if kind=='note' else '')+'/>')
        lines=textwrap.wrap(text,width=25 if kind=='decision' else 33,break_long_words=False)
        for j,line in enumerate(lines):
            yy=y+h/2+(j-(len(lines)-1)/2)*19+5
            svg.append(f'<text x="{x+w/2}" y="{yy}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#17354A">{escape(line)}</text>')
    svg.append('</svg>')
    (OUT/f'AI-LifeLab-User-Flow-{flow.slug}.svg').write_text('\n'.join(svg),encoding='utf-8')

path=OUT/'AI-LifeLab-User-Flows.drawio'
E.ElementTree(root).write(path,encoding='utf-8',xml_declaration=True)
# A standalone copy allows importing just the monitoring flow into another file.
standalone=E.Element('mxfile',host='app.diagrams.net',type='device')
standalone.append(E.fromstring(E.tostring(root.findall('diagram')[-1])))
E.ElementTree(standalone).write(OUT/'AI-LifeLab-Giam-sat-Flow.drawio',encoding='utf-8',xml_declaration=True)
# Validate native file structure and connector references before delivery.
parsed=E.parse(path)
for diagram in parsed.findall('diagram'):
    cells=diagram.find('mxGraphModel/root');ids={c.get('id') for c in cells}
    for c in cells:
        if c.get('edge')=='1':assert c.get('source') in ids and c.get('target') in ids
    print(diagram.get('id'), ':',sum(c.get('vertex')=='1' for c in cells),'shapes,',sum(c.get('edge')=='1' for c in cells),'connectors')
print(path)
