from pathlib import Path
from html import escape

ROOT=Path(__file__).resolve().parent
INK='#17365E';BLUE='#3B82F6';BORDER='#bdd3e6'
def text(x,y,s,size=16,weight=400):return f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{INK}">{escape(s)}</text>'
def start(w,h,title):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(title)}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="{BLUE}"/></marker></defs><rect width="{w}" height="{h}" fill="#f4faff"/>'+text(28,42,title,26,650)
def box(x,y,w,h,title,lines,fill='#EAF6F8'):
    out=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="15" fill="{fill}" stroke="{BORDER}"/>'+text(x+18,y+33,title,19,650)
    for i,s in enumerate(lines):out+=text(x+18,y+66+i*25,s,14)
    return out
def edge(points,label='',lx=0,ly=0):return f'<polyline points="{points}" fill="none" stroke="{BLUE}" stroke-width="2" marker-end="url(#arrow)"/>'+(text(lx,ly,label,13) if label else '')

s=start(1240,740,'AI LifeLab / Kiến trúc MVP')
s+=box(30,93,350,245,'Thiết bị người dùng',['React + TypeScript','UI học sinh / giáo viên','MediaPipe + bộ chuyển cử chỉ','Camera xử lý tại đây','Chuột / bàn phím thay thế'],'#E8F8F1')
s+=box(466,93,370,245,'Một backend FastAPI',['Xác thực + quyền + API','Simulation: 6 bộ quy tắc','Lưu nháp / lượt thử / hoàn thành','AI adapter + kiểm tra output','Không nhận video để tính mô phỏng'])
s+=box(922,93,288,245,'PostgreSQL',['10 bảng quan hệ','Snapshot danh sách được giao','Lượt thử / phản tư bất biến','FK và ràng buộc duy nhất'],'#FFF7E6')
s+=edge('380,192 465,192','JSON',395,177)+edge('836,192 921,192','Lưu/đọc',850,177)
s+=box(466,436,370,190,'Dịch vụ LLM ngoài',['Nhận ngữ cảnh tối thiểu','Coach / gợi ý nhận xét','Không tính kết quả mô phỏng'],'#FCE8EE')
s+=box(30,436,350,190,'Cấu hình bài v1',['6 bài + dữ liệu + input schema','Bộ quy tắc Python có phiên bản','Câu hỏi dự phòng; hash cấu hình'],'#E5F1FF')
s+=edge('380,525 420,525 420,290 465,290','Đọc cấu hình',32,662)
s+=edge('650,338 650,435','Context / JSON, timeout 10s',666,385)
s+=text(30,708,'AI lỗi vẫn trả kết quả mô phỏng. Không dùng microservices, hàng đợi hoặc ML đề xuất riêng trong MVP.',15)
(ROOT/'architecture.svg').write_text(s+'</svg>',encoding='utf-8')

s=start(1280,1280,'AI LifeLab / ERD chính (chi tiết ràng buộc trong schema.sql)')
# Draw edges first, then boxes so crossing segments remain visually secondary.
for points,label,x,y in [
 ('310,166 430,166','1:N quản lý',325,151),('710,166 830,166','1:N thành viên',724,151),
 ('570,240 570,324','1:N nhiệm vụ',588,286),('710,404 830,404','1:N nhận bài',725,390),
 ('970,480 970,530 570,530 570,594','1:0..1 phiên',754,517),
 ('710,690 830,690','1:N lượt thử',724,675),
 ('570,790 570,884','1:0..1 phản tư',588,843),
 ('970,790 970,884','Nguồn lượt thử',987,842),
 ('710,982 830,982','Nguồn phản tư',720,968),
 ('430,710 310,710','1:N góp ý',326,695),
 ('170,240 170,560 410,560 410,642 430,642','Chủ phiên',214,546)
]:s+=edge(points,label,x,y)
s+=box(30,92,280,148,'users',['PK id','role / grade / auth_epoch'])
s+=box(430,92,280,148,'classes',['PK id','FK teacher_id → users'])
s+=box(830,92,320,148,'enrollments',['PK class_id + student_id','FK classes / users'])
s+=box(430,324,280,156,'assignments',['PK id','FK class_id + teacher_id','scenario / versions / due_at'],'#FFF7E6')
s+=box(830,324,320,156,'assignment_recipients',['PK assignment_id + student_id','FK assignment + enrollment','Snapshot tại thời điểm giao'],'#FFF7E6')
s+=box(430,594,280,196,'sessions',['PK id; FK student_id','FK assignment + recipient','status / draft / revision','versions / event_applied'],'#E8F8F1')
s+=box(830,594,320,196,'attempts',['PK id; FK session_id','UNIQUE session + request_id','input / result / phase','Bất biến'],'#E8F8F1')
s+=box(30,624,280,166,'teacher_reviews',['PK id; FK session / teacher','Góp ý riêng, có nguồn','Không thay lời học sinh'],'#FCE8EE')
s+=box(430,884,280,196,'reflections',['PK id; UNIQUE session_id','FK selected_attempt + session','Phản tư cuối; bất biến'])
s+=box(830,884,320,196,'evidence',['PK id; FK session','FK lượt thử + phản tư cùng phiên','UNIQUE session + criterion','Quan sát / đề xuất AI'])
s+=text(30,1152,'Bổ sung ở SQL: cùng phiên khi tham chiếu nguồn, phiên bản assignment, recipient và chống ghi trùng.',15)
s+=text(30,1187,'Backend kiểm tra vai trò, khối lớp, quyền chủ sở hữu và điều kiện hoàn thành trong giao dịch.',15)
s+=text(30,1222,'Không xóa enrollment/snapshot để thay đổi tiến độ bài đã giao; đổi thành viên bằng cờ active.',15)
(ROOT/'erd.svg').write_text(s+'</svg>',encoding='utf-8')

s=start(1380,1000,'AI LifeLab / Một lượt thử 8.1 và hoàn thành')
lanes=[('Học sinh',90),('Web / CV',330),('Backend',590),('Simulation',845),('PostgreSQL',1085),('LLM',1285)]
for label,x in lanes:
    s+=f'<rect x="{x-75}" y="82" width="150" height="52" rx="12" fill="#E5F1FF" stroke="{BORDER}"/>'+text(x-63,115,label,17,600)
    s+=f'<path d="M{x} 134V936" stroke="{BORDER}" stroke-dasharray="5 6"/>'
messages=[(0,1,'1. Chọn 70 cm, chạy',182),(1,2,'2. Input + request ID',239),(2,4,'3. Khóa phiên; kiểm tra trùng/quyền',296),(2,3,'4. Tính từ cấu hình v1',353),(3,2,'5. A: phút 5; B: CLEAR',410),(2,4,'6. Lưu attempt; COMMIT',467),(2,1,'7. Kết quả đã lưu',524),(1,2,'8. Đổi 60 cm, chạy với ID mới',581),(2,4,'9. Lưu lượt mới; giữ lượt cũ',638),(1,2,'10. Chọn lượt + phản tư cuối',695),(2,4,'11. Chốt phản tư, quan sát, COMPLETED',752),(2,1,'12. Trả hoàn thành, không chờ AI',809),(2,5,'13. Khi UI yêu cầu feedback riêng',866),(5,2,'14. JSON hoặc fallback sau 10s',923)]
for a,b,label,y in messages:
    xa=lanes[a][1];xb=lanes[b][1];s+=edge(f'{xa},{y} {xb},{y}',label,min(xa,xb)+10,y-10)
(ROOT/'sequence-8.1.svg').write_text(s+'</svg>',encoding='utf-8')
print('Created architecture.svg, erd.svg and sequence-8.1.svg')
