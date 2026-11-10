from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET
import textwrap, json, zipfile, hashlib, re

ROOT=Path(__file__).resolve().parent
DIAG=ROOT/'diagrams';DIAG.mkdir(exist_ok=True)
PALETTE={'step':('#F4FAFF','#7399B7'),'decision':('#FFF7E6','#B89958'),
 'terminal':('#E8F8F1','#679982'),'note':('#FFFFFF','#ADBCC7'),
 'data':('#E8F8F1','#679982'),'external':('#FFF7E6','#B89958')}
ANCHORS={'top':(.5,0),'topRight':(.8,0),'bottom':(.5,1),'left':(0,.5),'right':(1,.5)}

class Diagram:
 def __init__(self,slug,title,h=1800,w=1200):
  self.slug,self.title,self.h,self.w=slug,title,h,w;self.nodes={};self.edges=[]
 def n(self,key,label,x,y,kind='step',w=280,h=70):
  self.nodes[key]=(label,x,y,w,h,kind);return key
 def e(self,a,b,label='',src='bottom',dst='top',via=()):
  self.edges.append((a,b,label,src,dst,via))
 def chain(self,*keys):
  for a,b in zip(keys,keys[1:]):self.e(a,b)
 def point(self,k,side):
  _,x,y,w,h,_=self.nodes[k];ax,ay=ANCHORS[side];return x+w*ax,y+h*ay

s=Diagram('01-student','User flow · Học sinh',2350)
for key,label,y,kind in [
 ('start','Bắt đầu',130,'terminal'),('login','Đăng nhập → Chọn bài / nhiệm vụ',250,'step'),
 ('resume','Tiếp tục phiên đã lưu hoặc tạo phiên mới',370,'step'),
 ('read','Đọc nhiệm vụ và hướng dẫn thao tác',490,'step'),
 ('method','Chọn cách thao tác',610,'decision'),
 ('place','Nắm – kéo – thả; chốt bố trí vật',850,'step'),
 ('predict','Dự đoán kết quả và nêu lý do',980,'step'),
 ('run','Chạy → kiểm tra → tính và lưu lượt thử',1110,'step'),
 ('result','Xem kết quả; đối chiếu với dự đoán',1240,'step'),
 ('coach','Tùy chọn hỏi Coach / xem gợi ý',1370,'step'),
 ('retry','Thử phương án khác?',1500,'decision'),
 ('ready','Đủ điều kiện hoàn thành?',1700,'decision'),
 ('reflect','Chọn lượt cuối → Viết phản tư',1900,'step'),
 ('complete','Gửi hoàn thành → Lưu bằng chứng',2030,'step'),
 ('finish','Xem hồ sơ tiến trình',2160,'terminal')]:s.n(key,label,440,y,kind,h=100 if kind=='decision' else 70)
s.n('camera','Bật camera → Kiểm tra nhận tay',800,735,w=300)
s.n('mouse','Dùng chuột / bàn phím',70,735)
s.n('errors','Đầu vào sai: sửa lựa chọn. Lỗi lưu: giữ bản tạm và thử lại; chỉ báo Đã lưu khi máy chủ xác nhận.',70,1060,'note',h=130)
s.n('fallback','Camera lỗi → chuyển chuột. Coach lỗi → gợi ý có sẵn. Không cần Coach để hoàn thành.',800,1330,'note',w=300,h=130)
s.n('missing','Xem yêu cầu còn thiếu; làm tiếp',800,1720,w=300)
s.n('scope','Flow chi tiết cho bài 8.2. Năm bài khác dùng thao tác phù hợp và giữ bước thử – phản tư.',70,1850,'note',h=130)
s.chain('start','login','resume','read','method')
s.e('method','camera','CV','right','top',[(950,660)])
s.e('method','mouse','Chuột','left','top',[(210,660)])
s.e('camera','place','','bottom','right',[(950,885)])
s.e('mouse','place','','bottom','left',[(210,885)])
s.chain('place','predict','run','result','coach','retry')
s.e('retry','place','Có','left','left',[(390,1550),(390,885)])
s.e('retry','ready','Không');s.e('ready','missing','Chưa','right','left')
s.e('missing','place','','right','right',[(1150,1755),(1150,885)])
s.e('ready','reflect','Đủ');s.chain('reflect','complete','finish')

t=Diagram('02-teacher','Teacher flow · Giao bài và giám sát',2100)
for key,label,y,kind in [
 ('start','Bắt đầu',130,'terminal'),('login','Đăng nhập → Chọn lớp phụ trách',260,'step'),
 ('select','Chọn kịch bản → Xem trước',390,'step'),('setup','Đặt mục tiêu, hướng dẫn và thời hạn',520,'step'),
 ('assign','Xác nhận giao bài → Lưu danh sách nhận',650,'step'),('overview','Xem tiến độ tham gia / hoàn thành',850,'step'),
 ('student','Chọn học sinh và phiên cần xem',980,'step'),('data','Có dữ liệu bài làm?',1110,'decision'),
 ('inspect','Xem dự đoán, lượt thử và phản tư nếu có',1330,'step'),
 ('review','Đối chiếu bằng chứng → Viết nhận xét',1460,'step'),('save','Lưu nhận xét riêng của giáo viên',1590,'step'),
 ('more','Tiếp tục theo dõi?',1730,'decision'),('finish','Kết thúc',1940,'terminal')]:t.n(key,label,440,y,kind,h=100 if kind=='decision' else 70)
t.n('empty','Chưa bắt đầu: chưa kết luận về năng lực',800,1130,w=300,h=90)
t.n('identity','Một học sinh một tài khoản từ danh sách đã kiểm tra. Đổi lớp / đặt lại mật khẩu giữ nguyên tài khoản.',70,360,'note',h=130)
t.n('errors','Không có quyền: không mở dữ liệu. Lỗi giao / lưu: báo chưa thành công, cho thử lại chống trùng.',70,720,'note',h=130)
t.n('privacy','Theo dõi dữ liệu đã lưu; không xem camera trực tiếp. Nhận xét AI là hỗ trợ, giáo viên tự nhận định.',800,1450,'note',w=300,h=130)
t.chain('start','login','select','setup','assign','overview','student','data')
t.e('data','empty','Chưa','right','left');t.e('empty','more','','right','right',[(1150,1175),(1150,1780)])
t.e('data','inspect','Có');t.chain('inspect','review','save','more')
t.e('more','overview','Có','left','left',[(390,1780),(390,885)])
t.e('more','finish','Không')

a=Diagram('03-architecture','Kiến trúc · Một backend, xử lý tay trên thiết bị',1230)
a.n('student','Học sinh / Giáo viên',430,140,'terminal',340,70)
a.n('web','WEB APP · React + TypeScript\nBàn 3D · thao tác · lịch sử\nHiển thị Coach và fallback',390,330,w=420,h=130)
a.n('cv','CV TRÊN THIẾT BỊ\nCamera → landmarks → cử chỉ\nHai tay + khóa vật + snap ô',30,330,w=310,h=130)
a.n('api','BACKEND · FastAPI\nĐăng nhập / quyền · phiên / giao bài\nQuy tắc mô phỏng · Coach adapter',390,650,w=420,h=140)
a.n('db','POSTGRESQL\n13 bảng: tài khoản, lớp, bài làm\nDự đoán, hội thoại, bằng chứng',30,940,'data',340,130)
a.n('config','CẤU HÌNH CÓ PHIÊN BẢN\n6 bài · quy tắc · prompts\nSchema · gợi ý dự phòng',430,940,'data',340,130)
a.n('llm','LLM PROVIDER\nSinh câu hỏi / gợi ý\nKhông tính kết quả chính thức',850,650,'external',310,140)
a.n('note','Video không rời thiết bị. Frontend gửi bố trí đã chốt, không gửi từng khung hình. Khóa LLM ở backend.',850,940,'note',310,130)
a.e('student','web','Thao tác / hiển thị');a.e('cv','web','Hành động tay','right','left')
a.e('web','api','HTTPS JSON: bố trí, dự đoán, chat')
a.e('api','db','Đọc / ghi','bottom','top',[(600,850),(200,850)])
a.e('api','config','Nạp phiên bản');a.e('api','llm','Ngữ cảnh giới hạn / JSON','right','left')

c=Diagram('04-erd-class','ERD A · Tài khoản, lớp và nhiệm vụ',1420)
c.n('users','users\nPK id · username UNIQUE\nrole · grade · school_code\nstudent_code · tên hiển thị',70,150,'data',420,170)
c.n('classes','classes\nPK id\nFK teacher_id → users\nname · grade',710,150,'data',420,170)
c.n('enroll','enrollments\nPK / FK class_id + student_id\nactive · enrolled_at',710,490,'data',420,150)
c.n('assign','assignments\nPK id · FK class_id + teacher_id\nscenario_id · config_version/hash\ndue_at · request_id',70,490,'data',420,170)
c.n('recipients','assignment_recipients\nPK assignment_id + student_id\nFK assignment + enrollment\nSnapshot danh sách lúc giao',70,850,'data',420,170)
c.n('sessions','sessions (chi tiết trang ERD B)\nPK id · FK student_id\nFK assignment + student nếu có\nstatus · draft · revision',710,850,'data',420,170)
c.n('note','Đọc: 1:0..N = một có thể có nhiều. Mỗi phiên gắn nhiệm vụ có đúng một người nhận; người nhận có thể chưa có phiên. Phiên tự học không cần assignment. Vai trò và quyền do backend kiểm tra.',70,1170,'note',1060,120)
c.e('users','classes','1:0..N · giáo viên','right','left')
c.e('classes','enroll','1:0..N · thành viên')
c.e('classes','assign','1:0..N · giao bài','left','right',[(600,235),(600,575)])
c.e('users','enroll','1:0..N · học sinh','bottom','left',[(280,370),(530,370),(530,565)])
c.e('assign','recipients','1:1..N · khi giao hợp lệ')
c.e('enroll','recipients','1:0..N','bottom','topRight',[(920,740),(406,740)])
c.e('recipients','sessions','1:0..1 · bắt đầu bài','right','left')
c.e('users','sessions','1:0..N · chủ phiên','left','bottom',[(30,235),(30,1090),(920,1090)])

l=Diagram('05-erd-learning','ERD B · Phiên trải nghiệm và bằng chứng',1780)
l.n('session','sessions\nPK id · FK student / assignment\nscenario/version · draft/revision\nstatus · event_applied',430,150,'data',340,170)
l.n('prediction','predictions\nPK id · FK session_id\nplacements · revision/hash\noutcome · explanation',40,500,'data',340,170)
l.n('attempt','attempts\nPK id · FK session_id\nFK prediction_id UNIQUE (nullable)\ninput · result · source · request_id',430,500,'data',340,170)
l.n('coach','coach_turns\nPK id · FK session_id\nquestion / answer · context_snapshot\nPENDING / READY · fallback\nNguồn: xem ERD C',820,500,'data',340,170)
l.n('reflection','reflections\nPK id · FK session_id UNIQUE\nFK selected_attempt_id\nPhản tư cuối bất biến',430,900,'data',340,170)
l.n('evidence','evidence\nPK id · FK session_id\nFK attempt / comparison / reflection\ncriterion_id · quan sát / AI đề xuất',40,1260,'data',340,170)
l.n('review','teacher_reviews\nPK id · FK session_id\nFK teacher_id → users\ncomment · assessments · request_id',820,1260,'data',340,170)
l.n('note','Mỗi phiên có 0..N dự đoán, lượt thử, lượt Coach và nhận xét; 0..1 phản tư cuối. Bài 8.2 bắt buộc prediction; một prediction dùng tối đa một attempt. FK bằng chứng phải cùng phiên. Nguồn Coach dùng bảng nối coach_turn_sources, xem trang ERD C.',40,1540,'note',1120,150)
l.e('session','prediction','1:0..N','left','top',[(210,235)])
l.e('session','attempt','1:0..N')
l.e('session','coach','1:0..N','right','top',[(990,235)])
l.e('prediction','attempt','1:0..1','right','left')
l.e('attempt','reflection','Lượt được chọn: 1:0..1')
l.e('session','reflection','1:0..1 · chốt cuối','right','right',[(795,235),(795,985)])
l.e('reflection','evidence','Nguồn phản tư','left','top',[(210,985)])
l.e('attempt','evidence','Nguồn lượt thử','bottom','right',[(600,760),(405,760),(405,1345)])
l.e('session','review','1:0..N','right','top',[(1185,235),(1185,1170),(990,1170)])

q=Diagram('06-sequence','Sequence · Chạy mô phỏng và hỏi Coach',1470,1300)
for key,label,x in [('student','Học sinh',30),('web','Web / CV',280),('api','Backend',530),('db','PostgreSQL',780),('llm','LLM',1030)]:q.n(key,label,x,150,w=210,h=65)
# Lifelines are represented by narrow note shapes; messages are separate horizontal connectors.
for idx,(a1,b1,label,y) in enumerate([
 ('student','web','Nắm / đặt → Chốt bố trí',300),('student','web','Nhập dự đoán → Chạy',400),
 ('web','api','Lưu prediction + phương án/revision',500),('api','db','Kiểm tra quyền → Lưu prediction',600),
 ('api','web','Trả prediction_id đã lưu',650),
 ('web','api','POST attempt + prediction_id',700),('api','db','Khóa phiên; tính; lưu; COMMIT',800),
 ('api','web','Trả kết quả đã lưu',900),('student','web','Hỏi Coach về lượt thử',1000),
 ('web','api','Gửi câu hỏi + ID nguồn',1100),('api','llm','Ngữ cảnh → JSON (hoặc fallback)',1200),
 ('api','db','Lưu hỏi–đáp và metadata',1300),('api','web','JSON đã kiểm tra / fallback',1400)]):
  # Hidden semantic endpoints keep each message at the correct time in drawio.
  for k in (a1,b1):q.n(f'{k}{idx}','',q.nodes[k][1]+104,y,'lifeline',w=2,h=2)
  q.e(f'{a1}{idx}',f'{b1}{idx}',label,'right' if q.nodes[a1][1]<q.nodes[b1][1] else 'left','left' if q.nodes[a1][1]<q.nodes[b1][1] else 'right')

v=Diagram('07-cv-state','State diagram · Một bàn tay, dùng chung khóa vật',1470)
v.n('idle','IDLE\nKhông giữ vật',440,170,'terminal',280,90)
v.n('hold','DRAGGING\nGiữ một vật theo hand_track_id',440,450,w=280,h=100)
v.n('valid','Thả vào ô hợp lệ?',440,750,'decision',280,110)
v.n('commit','COMMIT\nChốt ô · revision +1 · phát một lần',70,1010,w=330,h=100)
v.n('cancel','CANCEL\nTrả vật về vị trí đã chốt',800,1010,w=330,h=100)
v.n('note','Chỉ nắm khi vật chưa bị tay khác giữ. Mỗi tay một state machine; khóa vật dùng chung. Mất tay, đổi phương thức hoặc theo dõi mơ hồ đều hủy. Không suy ra ID tay từ thứ tự mảng.',70,1250,'note',1060,130)
v.e('idle','hold','Khép ngón ổn định trên vật rảnh')
v.e('hold','valid','Mở ngón ổn định')
v.e('hold','hold','Di chuyển tay','right','right',[(760,500),(760,620),(720,620)])
v.e('valid','commit','Có','left','top',[(235,805)])
v.e('valid','cancel','Không','right','top',[(965,805)])
v.e('hold','cancel','Mất tay / hủy','right','right',[(1180,500),(1180,1060)])
v.e('commit','idle','Sau chống lặp','left','left',[(30,1060),(30,215)])
v.e('cancel','idle','Giải phóng khóa','right','right',[(1150,1060),(1150,215)])

f=Diagram('08-cv-coach-data','Flow CV – Coach · Thao tác và thời điểm lưu',2260)
for key,label,y,kind in [
 ('start','Mở bài đòn bẩy 3D',130,'terminal'),
 ('camera','Bật camera → Nhận vị trí hai tay',270,'step'),
 ('gesture','Nắm → Di chuyển vật → Thả',410,'step'),
 ('valid','Thả đúng ô và không bị chiếm?',550,'decision'),
 ('draft','Chốt phương án → Tăng revision',760,'step'),
 ('predict','Dự đoán và giải thích trước lượt thử',950,'step'),
 ('run','Nhấn Chạy → Backend kiểm tra và tính',1090,'step'),
 ('result','Xem kết quả → Lưu dự đoán và lượt thử',1230,'step'),
 ('ask','Muốn hỏi Coach?',1370,'decision'),
 ('context','Chọn nguồn → Chốt ngữ cảnh theo revision',1560,'step'),
 ('reply','Gọi LLM → Kiểm JSON / nguồn / action',1700,'step'),
 ('show','Lưu hỏi–đáp → Hiển thị / tô sáng vật',1840,'step'),
 ('next','Thử lại hoặc viết phản tư để hoàn thành',2040,'terminal')]:f.n(key,label,440,y,kind,h=100 if kind=='decision' else 80)
f.n('cancel','Mất tay / thả sai: hủy phần đang kéo, trả vật về vị trí đã chốt',60,560,w=280,h=110)
f.n('local','Trên thiết bị: video, landmarks, con trỏ và vật đang giữ. Không gửi từng khung hình.',810,340,'note',w=310,h=130)
f.n('savedraft','sessions: lưu draft + revision khi online; chỉ báo Đã lưu sau xác nhận',810,760,'data',w=310,h=100)
f.n('aierror','Timeout / sai đầu ra: dùng gợi ý có sẵn; đánh dấu fallback',60,1700,'note',w=280,h=110)
f.n('scope','Hỏi trước khi chạy cũng được: dùng phương án đã chốt, chưa có kết quả thì không tự tạo kết quả.',810,1510,'note',w=310,h=130)
f.n('memory','Bản thử nghiệm hiện tại lưu tạm. Các bảng trong tài liệu là đích thiết kế, chưa phải database đã triển khai.',60,900,'note',w=280,h=140)
f.chain('start','camera','gesture','valid')
f.e('valid','cancel','Không','left','right');f.e('cancel','gesture','','top','left',[(200,450)])
f.e('valid','draft','Có');f.e('draft','savedraft','Lưu nháp','right','left')
f.chain('draft','predict','run','result','ask')
f.e('ask','context','Có');f.e('ask','next','Không','right','right',[(1170,1420),(1170,2080)])
f.chain('context','reply','show','next')
h=Diagram('09-erd-coach','ERD C · Chat Coach và nguồn tham chiếu',1470)
h.n('sessions','sessions\nPK id\nChủ phiên và cấu hình bài\nChi tiết ở trang ERD B',40,160,'data',300,220)
h.n('turns','coach_turns\nPK id · FK session_id\nquestion / answer · mode\ncontext_snapshot / hash\nPENDING → READY · generation\nprompt / model · fallback',430,160,'data',340,220)
h.n('sources','coach_turn_sources\nPK coach_turn_id + attempt_id\nFK coach_turn_id + session_id\nFK attempt_id + session_id\nsource_order: 1–4, không trùng',430,780,'data',340,200)
h.n('attempts','attempts\nPK id · UNIQUE id + session_id\ninput_json / result_json\nChi tiết ở trang ERD B',820,780,'data',340,200)
h.n('lifecycle','Một câu hỏi dùng 0..4 lượt thử. Một lượt thử có thể được nhiều câu hỏi tham chiếu. FK ghép cùng session_id ngăn lấy nguồn của phiên khác. PREDICT trước chạy có thể chưa có nguồn attempts nhưng luôn có snapshot phương án.',40,1110,'note',1120,130)
h.n('transaction','Giao dịch ngắn: tạo PENDING + nguồn → COMMIT → gọi LLM → kiểm đầu ra → cập nhật READY nếu generation còn khớp. Lỗi model vẫn lưu READY với fallback=true. Không giữ khóa SQL trong lúc chờ LLM.',40,1280,'note',1120,130)
h.e('sessions','turns','1:0..N','right','left')
h.e('turns','sources','1:0..4')
h.e('attempts','sources','1:0..N','left','right')
DIAGRAMS=[s,t,a,c,l,q,v,f,h]
mx=ET.Element('mxfile',host='app.diagrams.net',type='device',version='24.7.17')
for d in DIAGRAMS:
 diagram=ET.SubElement(mx,'diagram',id=d.slug,name=d.title)
 model=ET.SubElement(diagram,'mxGraphModel',grid='1',gridSize='10',page='1',pageScale='1',pageWidth=str(d.w),pageHeight=str(d.h),connect='1',arrows='1')
 cells=ET.SubElement(model,'root');ET.SubElement(cells,'mxCell',id='0');ET.SubElement(cells,'mxCell',id='1',parent='0')
 def cell(key,label,x,y,w,h,style):
  el=ET.SubElement(cells,'mxCell',id=key,value=label,style=style,vertex='1',parent='1')
  ET.SubElement(el,'mxGeometry',x=str(x),y=str(y),width=str(w),height=str(h),attrib={'as':'geometry'})
 cell('title',d.title,40,30,d.w-80,60,'text;html=0;fontSize=25;fontStyle=1;align=left;fontColor=#17354A;')
 svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{d.w}" height="{d.h}" viewBox="0 0 {d.w} {d.h}">',
 '<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#607B8E"/></marker></defs><rect width="100%" height="100%" fill="white"/>',
 f'<text x="40" y="67" font-family="Arial,sans-serif" font-size="25" font-weight="bold" fill="#17354A">{escape(d.title)}</text>',
 '<text x="40" y="104" font-family="Arial,sans-serif" font-size="14" fill="#607B8E">AI LifeLab · MVP v2 · 05/11/2026 · Bản thiết kế</text>']
 if d is q:
  for key in ['student','web','api','db','llm']:
   x=d.nodes[key][1]+105
   svg.append(f'<path d="M{x} 215 V1450" stroke="#B5C6D2" stroke-dasharray="5 5"/>')
   el=ET.SubElement(cells,'mxCell',id='line'+key,style='dashed=1;endArrow=none;strokeColor=#B5C6D2;',edge='1',parent='1')
   geo=ET.SubElement(el,'mxGeometry',relative='1',attrib={'as':'geometry'})
   ET.SubElement(geo,'mxPoint',x=str(x),y='215',attrib={'as':'sourcePoint'});ET.SubElement(geo,'mxPoint',x=str(x),y='1450',attrib={'as':'targetPoint'})
 for key,(label,x,y,w,h,kind) in d.nodes.items():
  if kind=='lifeline':
   cell(key,'',x,y,w,h,'opacity=0;strokeOpacity=0;fillOpacity=0;');continue
  fill,stroke=PALETTE[kind]
  style=('rhombus;' if kind=='decision' else 'ellipse;' if kind=='terminal' else 'rounded=1;arcSize=15;')
  style+=f'whiteSpace=wrap;html=0;fontSize=15;fontFamily=Arial;spacing=12;fillColor={fill};strokeColor={stroke};fontColor=#17354A;strokeWidth=1.5;'
  if kind=='note':style+='dashed=1;'
  cell(key,label,x,y,w,h,style)
 for i,(aa,bb,label,src,dst,via) in enumerate(d.edges):
  ex,ey=ANCHORS[src];ix,iy=ANCHORS[dst]
  edge=ET.SubElement(cells,'mxCell',id='e'+str(i),value=label,source=aa,target=bb,edge='1',parent='1',style=f'edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endArrow=block;endFill=1;strokeColor=#607B8E;fontColor=#17354A;fontSize=13;labelBackgroundColor=#FFFFFF;exitX={ex};exitY={ey};entryX={ix};entryY={iy};')
  geo=ET.SubElement(edge,'mxGeometry',relative='1',attrib={'as':'geometry'})
  if d is q:geo.set('y','-14')
  if d is a and src=='right' and dst=='left':geo.set('y','-90')
  if via:
   ar=ET.SubElement(geo,'Array',attrib={'as':'points'})
   for x,y in via:ET.SubElement(ar,'mxPoint',x=str(x),y=str(y))
  pts=[d.point(aa,src),*via,d.point(bb,dst)]
  svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="none" stroke="#607B8E" stroke-width="1.5" marker-end="url(#arr)"/>')
  if label:
   # Center on the longest connector segment, away from node bodies.
   p1,p2=max(zip(pts,pts[1:]),key=lambda p:abs(p[0][0]-p[1][0])+abs(p[0][1]-p[1][1]))
   x,y=(p1[0]+p2[0])/2,(p1[1]+p2[1])/2
   width=min(len(label)*7+16,420)
   x=max(width/2+8,min(x,d.w-width/2-8))
   offset=-17 if d is q else -90 if d is a and src=='right' and dst=='left' else 0
   svg.append(f'<rect x="{x-width/2}" y="{y-12+offset}" width="{width}" height="24" fill="white"/><text x="{x}" y="{y+5+offset}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#17354A">{escape(label)}</text>')
 for label,x,y,w,h,kind in d.nodes.values():
  if kind=='lifeline':continue
  fill,stroke=PALETTE[kind];attr=f'fill="{fill}" stroke="{stroke}" stroke-width="1.5"'
  if kind=='decision':svg.append(f'<polygon points="{x+w/2},{y} {x+w},{y+h/2} {x+w/2},{y+h} {x},{y+h/2}" {attr}/>')
  elif kind=='terminal':svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" {attr}/>')
  else:svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" {attr} '+('stroke-dasharray="6 4"' if kind=='note' else '')+'/>')
  lines=[]
  for para in label.split('\n'):lines.extend(textwrap.wrap(para,width=max(18,int(w/(8.5 if kind=='decision' else 7.4))),break_long_words=False) or [''])
  assert len(lines)*19<=h-8,(d.slug,label,'text overflow')
  for j,line in enumerate(lines):svg.append(f'<text x="{x+w/2}" y="{y+h/2+(j-(len(lines)-1)/2)*19+5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#17354A">{escape(line)}</text>')
 svg.append('</svg>');(DIAG/(d.slug+'.svg')).write_text('\n'.join(svg),encoding='utf-8')
ET.ElementTree(mx).write(ROOT/'AI-LifeLab-System-v2.drawio',encoding='utf-8',xml_declaration=True)
erd=ET.Element('mxfile',host='app.diagrams.net',type='device')
for page in mx.findall('diagram'):
 if page.get('id') in ['04-erd-class','05-erd-learning','09-erd-coach']:
  erd.append(ET.fromstring(ET.tostring(page)))
ET.ElementTree(erd).write(ROOT/'database/ERD-Database.drawio',encoding='utf-8',xml_declaration=True)

# Full-project schema has one canonical generator.
import subprocess, sys
subprocess.run([sys.executable,str(ROOT/'database/sync_schema.py')],check=True)

contracts={
 'status':'DESIGN_EXAMPLES_NOT_IMPLEMENTED','scenario_id':'8.2','scenario_version':'balance-v2',
 'presentation':'3D tabletop; objects snap to discrete slots; unchanged balance rules',
 'objects':[{'id':'A','mass_kg':1},{'id':'B','mass_kg':2}],
 'allowed_slots':[-4,-3,-2,-1,1,2,3,4],'slot_unit_m':.1,'g':9.8,
 'attempt_request_example':{'request_id':'uuid','prediction_id':'uuid','placements':[{'object_id':'A','slot':-4},{'object_id':'B','slot':2}],'source':'gesture'},
 'result_example':{'left_torque_nm':3.92,'right_torque_nm':3.92,'net_torque_nm':0,'outcome':'BALANCED'},
 'coach_response_example':{'message':'Hai phía có mômen bằng nhau trong lượt vừa thử.','question':'Vì sao vật nhẹ hơn lại cần đặt xa điểm tựa hơn?','hint_level':1,'referenced_attempt_ids':['uuid-of-saved-attempt'],'ui_action':{'type':'HIGHLIGHT_OBJECT','object_id':'A'}},
 'coach_allowed_ui_actions':['NONE','HIGHLIGHT_OBJECT'],
 'cv_action_example':{'action':'PLACE_OBJECT','object_id':'A','slot':-4,'hand_track_id':'local-1','source':'gesture'},
 'privacy':'hand_track_id and landmarks remain local; backend persists confirmed placements only',
 'canonical_plan_hash':'Sort by object_id; canonical JSON using integer slots; SHA256; server recomputes. Include scenario_version. Bind prediction to plan and revision.'}
(ROOT/'contracts-v2.json').write_text(json.dumps(contracts,ensure_ascii=False,indent=2),encoding='utf-8')

(ROOT/'README.md').write_text('''# AI LifeLab — Bộ thiết kế MVP v2

Thiết kế database CHỐT TOÀN DỰ ÁN: database/AI-LifeLab-Database-Toan-du-an.html (13 bảng). SQL chuẩn: database/schema.sql; schema-v2.sql là bản sao đồng nhất. Không có bản 7 bảng riêng.

Mở AI-LifeLab-Phan-tich-Thiet-ke-v2.html để đọc. HTML dùng các SVG trong diagrams; giữ cùng thư mục khi di chuyển.

Trong diagrams.net: File → Open From → Device → AI-LifeLab-System-v2.drawio. Có 9 tab: học sinh, giáo viên, kiến trúc, ERD lớp, ERD học tập, sequence, trạng thái CV, flow CV–Coach–dữ liệu, ERD nguồn Chat. Mọi hình và đường nối đều chỉnh sửa được.

Đọc thêm AI-LifeLab-CV-Chat-Flow-Database.html: cách tay tương tác với bàn 3D, Coach theo nguồn, từ điển dữ liệu và thời điểm lưu. Giao diện chuyển sang 3D, quy tắc đòn bẩy và vị trí rời rạc giữ nguyên. Phát triển trước một bài; năm bài khác là phạm vi sau.

Phạm vi mới: 8.2 là đòn bẩy, không còn bài CV chọn công trình chứa nước. 5 bài khác giữ đặc tả cũ; file tham khảo nằm trong references. Bản v1 không được xem là hợp đồng API hoàn chỉnh của v2.

schema-v2.sql tạo mới 13 bảng, không chạy trên database đã tồn tại. DDL đã kiểm bằng PostgreSQL bộ nhớ PGlite; chưa chạy server PostgreSQL và chưa tích hợp camera/LLM. contracts-v2.json là ví dụ thiết kế, không phải JSON Schema hay OpenAPI đầy đủ.

build_package.py tạo sơ đồ, SQL và ví dụ. render_document.py tạo HTML từ Markdown. validate_package.py kiểm tra tài liệu, sơ đồ, quan hệ và phép tính rồi đóng ZIP. check_visual.py kiểm tra hiển thị HTML/SVG bằng trình duyệt. Các kiểm tra đó không thay thế kiểm thử phần mềm.
''',encoding='utf-8')
print('Generated 9 diagrams, fresh-install DDL and contract examples')
