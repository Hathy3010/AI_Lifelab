/* Summer Fresh × Spring Bloom. Purpose-built compositions and device layouts. */
module.exports=function(scenes,C){
Object.assign(C,{sky:'#F4FAFF',aqua:'#EAF6F8',cream:'#FFF7E6',mint:'#E8F8F1',forest:'#3B82F6',green:'#10B981',yellow:'#FFBF24',pink:'#FF8FA3',ink:'#17365E',muted:'#4F6581',border:'#CADDE9',canvas:'#E5F1FF',sage:'#95D5BF',blue:'#3B82F6',ochre:'#825608',red:'#A93954',peach:'#FCE8EE',butter:'#FFF0C2',leaf:'#DDF4E8',onPrimary:'#071B35',hover:'#70A3F8'});
// Reconcile existing screens with the new visual language, keeping their routes.
for(const s of scenes)for(const n of s.nodes){
 if(n.type==='text'){n.family=n.family||'Manrope';if(n.size===11)n.size=12;if(n.size===13)n.size=14;
  n.value=n.value.replaceAll('Thiết kế cầu chịu tải','Cảnh báo mực nước').replaceAll('Thiết kế cầu','Cảnh báo mực nước').replaceAll('thiết kế cầu','cảnh báo mực nước').replaceAll('Cây cầu từ ý tưởng của bạn','Khi nước bắt đầu dâng').replaceAll('Cây cầu đầu tiên','Tín hiệu đầu tiên').replaceAll('cây cầu','hệ thống').replaceAll('thanh giằng','ngưỡng cảnh báo').replaceAll('độ võng','mực nước').replaceAll('kết cấu','cấu hình').replaceAll('Khi thành phố ngập nước','Một khu phố xanh hơn');
  const copy={
   '“Bạn đã thêm ngưỡng cảnh báo\nsau khi quan sát mực nước.”':'“Bạn đã đổi ngưỡng cảnh báo\nsau khi quan sát mực nước.”',
   'Thiết kế & thử':'Thiết lập & thử',
   'Thiết kế một hệ thống chịu được tải mục tiêu,\nvới số vật liệu nằm trong ngân sách.':'Chọn ngưỡng để phát cảnh báo sớm,\ntrước khi mực nước đạt 80 cm.',
   'TẢI MỤC TIÊU':'MỨC NGUY HIỂM','100 đơn vị':'80 cm','NGÂN SÁCH':'MỰC NƯỚC BAN ĐẦU','100 điểm':'45 cm',
   'Học sinh thiết kế, thử tải\nvà giải thích điều chỉnh.':'Học sinh chọn ngưỡng, chạy thử\nvà giải thích quyết định.',
   'Kiến thức: lực, cấu hình, nguồn lực.':'Kiến thức: cảm biến, số đo và ngưỡng.',
   'Quy tắc mô phỏng và giới hạn vật liệu theo kịch bản.':'Quy tắc mô phỏng và giới hạn cảm biến theo kịch bản.',
   '6 học sinh dừng ở bước thử tải · 2 báo lỗi camera.\nCó thể hướng dẫn chuyển sang chuột và bàn phím.':'6 học sinh dừng ở bước chọn ngưỡng.\nMở phiên học để xem lựa chọn và cách giải thích.',
   'Thử tải lần 01':'Chạy thử lần 01','Thử tải lần 02':'Chạy thử lần 02',
   'Tải đạt được: 60 đơn vị.':'Đặt ngưỡng cảnh báo 75 cm.','Tải đạt được: 80 đơn vị.':'Đặt ngưỡng cảnh báo 60 cm.',
   'Bổ sung ngưỡng cảnh báo vùng giữa cầu.':'Hạ ngưỡng cảnh báo từ 75 xuống 60 cm.',
   'Nguồn: thao tác 14:29\nvà lần thử tải 01 → 02.':'Nguồn: thao tác 14:29\nvà lần chạy thử 01 → 02.',
   '“Em thêm ngưỡng cảnh báo ở giữa vì ở lần thử đầu,\nphần giữa cầu bị võng nhiều nhất.”':'“Em hạ ngưỡng để phát cảnh báo sớm hơn,\ncho người dân có thời gian chuẩn bị.”'
  };if(copy[n.value])n.value=copy[n.value];
 }
 if(n.type==='input'&&n.field==='teacherComment')n.value='Em hãy giữ cùng xu hướng nước dâng\nrồi so sánh hai ngưỡng cảnh báo nhé.';
 if(n.type==='svg'){n.source=n.source.replaceAll('#245C49','#17365E').replaceAll('#78AF94','#10B981').replaceAll('#E4B465','#FFBF24').replaceAll('#527E9C','#3B82F6').replaceAll('#B8DCCB','#95D5BF');}
 if(n.type==='box'&&n.fill==='canvas'&&n.w>250&&n.h>100)n.fill=['mint','cream','aqua','peach'][Math.floor(n.x/400)%4];
}
let S;
const add=n=>(S.nodes.push(n),n);
const box=(x,y,w,h,fill='sky',radius=24,stroke=null)=>add({type:'box',x,y,w,h,fill,radius,stroke});
function txt(x,y,w,value,size=16,style='Regular',fill='ink',extra={}){return add({type:'text',x,y,w,h:Math.ceil(size*1.5*value.split('\n').length),value,size,style,fill,family:'Manrope',...extra});}
const svg=(x,y,w,h,source,name='Illustration')=>add({type:'svg',x,y,w,h,source,name});
const btn=(x,y,label,to,w=220,kind='Primary')=>add({type:'button',x,y,w,h:48,label,to,kind});
const link=(x,y,label,to,w=220)=>add({type:'link',x,y,w,h:32,label,to});
function pill(x,y,w,label,fill='butter'){box(x,y,w,30,fill,15);txt(x+12,y+5,w-24,label,12,'Bold',fill==='forest'?'onPrimary':'ink');}
function rule(x,y,w){box(x,y,w,1,'border',0);}
function begin(code,title,role='Student',keepShell=true){const old=scenes.find(s=>s.code===code);S={code,title,role,w:1440,h:1080,nodes:keepShell?old.nodes.filter(n=>(n.x<232||n.y<80)&&n.type!=='input'):[]};scenes[scenes.indexOf(old)]=S;return S;}
function heading(title,sub,kicker='PHÒNG THỰC HÀNH CUỘC SỐNG'){txt(272,110,1090,kicker,11,'Bold','muted',{letterSpacing:1.8});txt(272,139,1100,title,34,'Bold');txt(272,198,1090,sub,15,'Regular','muted');}
function sun(x,y,size=42){svg(x,y,size,size,`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80"><g fill="none" stroke="#17365E" stroke-width="2"><circle cx="40" cy="40" r="19" fill="#FFBF24"/><path d="M40 5v8m0 54v8M5 40h8m54 0h8M15 15l6 6m38 38 6 6M15 65l6-6m38-38 6-6"/></g></svg>`,'Signature / sun');}
function landscape(x,y,w,h,result=false){svg(x,y,w,h,`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 700 470" fill="none"><path d="M45 279 341 102l310 170-299 169Z" fill="#DDF4E8" stroke="#17365E" stroke-width="2"/><path d="M45 279v25l307 158v-21m299-169v25L352 462" stroke="#17365E" stroke-width="2" fill="#95D5BF"/><path d="M140 230c90 90 134-39 235 49s135 36 189 43" stroke="#3B82F6" stroke-width="${result?72:56}"/><path d="M140 230c90 90 134-39 235 49s135 36 189 43" stroke="#86B9FC" stroke-width="16"/><path d="m223 221 119-70 192 107-131 77" stroke="#FFF0C2" stroke-width="18"/><path d="m223 221 119-70 192 107-131 77" stroke="#17365E" stroke-width="2" stroke-dasharray="5 7"/><path d="m406 147 57-35 55 32-56 34Z" fill="#FF8FA3" stroke="#17365E" stroke-width="2"/><path d="M406 147v74l56 32v-75m56-34v76l-56 33" fill="#FCE8EE" stroke="#17365E" stroke-width="2"/><path d="m419 173 12 7m0 18-12-7m60-15 21-12m-21 32 21-12" stroke="#3B82F6" stroke-width="5"/><path d="m262 133 63-35 63 35-63 36Z" fill="#FFBF24" stroke="#17365E" stroke-width="2"/><path d="M262 133v64l63 37v-65m63-36v63l-63 38" fill="#FFF0C2" stroke="#17365E" stroke-width="2"/><path d="m275 163 14 8m0 18-14-8m67-5 25-15m-25 34 25-15" stroke="#17365E" stroke-width="4"/><path d="m470 305 71-40 55 32-71 42Z" fill="#10B981" stroke="#17365E" stroke-width="2"/><path d="M470 305v28l55 33v-27m71-42v29l-71 40" fill="#95D5BF" stroke="#17365E" stroke-width="2"/><path d="m193 263 38-21 55 31-39 24Z" fill="#FFF7E6" stroke="#17365E" stroke-width="2"/><path d="M193 263v40l54 31v-37m39-24v40l-39 21" fill="#E5F1FF" stroke="#17365E" stroke-width="2"/><path d="M337 307v-85" stroke="#17365E" stroke-width="4"/><rect x="316" y="201" width="43" height="34" rx="9" fill="${result?'#FFBF24':'#3B82F6'}" stroke="#17365E" stroke-width="2"/><circle cx="338" cy="217" r="5" fill="#FFF7E6"/><path d="M307 190q31-30 62 0m-74-14q43-44 86 0" stroke="${result?'#A93954':'#3B82F6'}" stroke-width="3" stroke-linecap="round"/><path d="M139 191v39m-15-45c0-24 32-24 32 0-4 19-28 19-32 0M559 199v46m-15-51c0-24 32-24 32 0-4 19-28 19-32 0" fill="#10B981" stroke="#17365E" stroke-width="2"/><circle cx="582" cy="65" r="35" fill="#FFBF24"/><path d="M556 65h52m-26-26v52" stroke="#17365E" stroke-width="2"/><path d="m83 124 25-15 25 15-25 15Z" fill="#FF8FA3"/><path d="m601 365 15-9 15 9-15 9Z" fill="#FF8FA3"/></svg>`,'Illustration / sensing neighbourhood');}
function wave(x,y,w,h){svg(x,y,w,h,`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 700 150"><path d="M0 100Q120 0 240 80T480 70 700 60v90H0Z" fill="#E5F1FF"/><path d="M0 110Q120 10 240 90T480 80 700 70" fill="none" stroke="#3B82F6" stroke-width="2" stroke-dasharray="4 9"/></svg>`,'Motif / discovery path');}
function stepper(x,y,w,labels,active){const step=w/labels.length;labels.forEach((label,i)=>{if(i<labels.length-1)box(x+i*step+step-65,y+15,60,2,i<active?'green':'border',0);box(x+i*step,y,32,32,i===active?'yellow':i<active?'green':'canvas',16);txt(x+i*step,y+5,32,i<active?'✓':String(i+1),13,'Bold','ink',{align:'CENTER'});txt(x+i*step+44,y+5,step-112,label,13,i===active?'Bold':'Regular',i===active?'ink':'muted');});}
function entry(x,y,w,title,meta,to,tone='canvas'){box(x,y,w,94,tone,18);txt(x+20,y+17,w-80,title,16,'Bold');txt(x+20,y+51,w-80,meta,13,'Regular','muted');link(x+w-49,y+31,'↗',to,35);}
function input(x,y,w,h,label,value,field){txt(x,y,w,label,14,'Bold');box(x,y+36,w,h,'sky',16,'border');add({type:'input',x:x+18,y:y+51,w:w-36,h:h-28,field,value,multiline:h>80});}
function fact(x,y,label,value,fill='ink'){txt(x,y,245,label,12,'Bold','muted');txt(x,y+24,245,value,27,'Bold',fill);}

// H01: art-directed landing, with one dominant story and a curated bento.
begin('H01','Thế giới thật. Lựa chọn của bạn.','Home',true);S.nodes=S.nodes.filter(n=>n.y<88);
pill(64,130,281,'HỌC QUA NHỮNG LẦN TỰ THỬ','leaf');sun(678,155,49);
txt(64,199,690,'Thế giới thật.\nLựa chọn của bạn.',58,'Bold');
txt(68,399,571,'Một quyết định nhỏ có thể thay đổi cả tình huống.\nThử nghiệm, quan sát và khám phá cách mình nghĩ.',17,'Regular','muted');
btn(68,501,'Khám phá trải nghiệm','H02',255);link(350,514,'Bắt đầu như thế nào? ↗','H03',270);
box(770,126,606,440,'aqua',34);landscape(775,130,605,412);pill(798,146,215,'BÀI TOÁN ĐANG CHỜ BẠN','butter');box(1070,481,281,64,'butter',17);txt(1088,490,248,'Nếu nước tiếp tục dâng,\nbạn sẽ cảnh báo khi nào?',13,'Bold');
txt(64,610,920,'Bạn muốn bắt đầu từ đâu?',28,'Bold');link(1180,619,'Tất cả trải nghiệm ↗','H02',210);
box(64,677,666,284,'canvas',28);pill(92,704,170,'KHOA HỌC · LỚP 8');txt(92,753,390,'Khi nước bắt đầu dâng',26,'Bold');txt(92,802,340,'Đặt ngưỡng cảm biến, thử tín hiệu\nvà bảo vệ khu dân cư.',14,'Regular','muted');landscape(420,714,280,196);link(92,901,'Khám phá thử thách →','S06',310);
box(754,677,302,284,'butter',28);txt(780,708,230,'Chi tiêu hôm nay,\nkế hoạch ngày mai.',23,'Bold');txt(780,806,235,'Cân nhắc nguồn lực cho\ndự án học đường.',14,'Regular','muted');link(780,901,'Tài chính cá nhân ↗','H02',250);
box(1080,677,296,284,'peach',28);sun(1106,706,48);txt(1106,775,238,'Thành phố\nmình muốn sống.',23,'Bold');link(1106,901,'Sống bền vững ↗','H02',245);
txt(68,1005,1150,'01 Chọn tình huống       02 Tự đưa ra quyết định       03 Nhìn kết quả       04 Hiểu thêm về mình',13,'Medium','muted');

// S01: a personal dashboard, not an administration screen.
begin('S01','Chào Minh Anh, hôm nay thử gì?');heading('Chào Minh Anh, hôm nay thử gì?','Một tình huống mới. Một cách nghĩ mới. Một bước của riêng bạn.');
box(272,249,720,351,'canvas',28);pill(300,276,192,'TIẾP TỤC KHÁM PHÁ','butter');txt(300,335,398,'Khi nước\nbắt đầu dâng',32,'Bold');txt(300,442,350,'Bạn đang chọn ngưỡng cảnh báo.\nLần thử tiếp theo đã sẵn sàng.',15,'Regular','muted');landscape(659,323,316,223);btn(300,524,'Tiếp tục trải nghiệm →','S08',265);
box(1016,249,376,351,'leaf',28);sun(1044,278,44);txt(1044,343,310,'Một điều muốn luyện',22,'Bold');txt(1044,396,310,'Giải thích lựa chọn\nbằng điều mình quan sát.',17,'Regular');box(1044,476,316,8,'sage',4);box(1044,476,106,8,'green',4);txt(1044,500,310,'1 trong 3 trải nghiệm đã ghi nhận',12,'Regular','muted');link(1044,550,'Mục tiêu của mình ↗','S03',300);
txt(272,640,700,'Đường khám phá của bạn',24,'Bold');link(791,645,'Xem hành trình ↗','S04',220);
entry(272,696,720,'Tín hiệu đầu tiên','Đã hoàn thành · Bạn đã thử 2 ngưỡng cảnh báo.','S11','aqua');entry(272,806,720,'Ngân sách dự án học đường','Còn một bước nhìn lại quyết định của mình.','S10','cream');
box(1016,624,376,351,'peach',28);pill(1044,652,212,'MỘT HƯỚNG ĐỂ THỬ TIẾP','butter');txt(1044,711,307,'Một khu phố\nxanh hơn.',27,'Bold');txt(1044,803,307,'Bạn muốn dành không gian\ncho cây xanh hay đường đi?',15,'Regular','muted');link(1044,917,'Xem gợi ý trải nghiệm ↗','S05',310);
link(272,950,'Mở thư viện trải nghiệm →','S05',500);

// S06: compact learning journey with prerequisites and clear challenge context.
begin('S06','Khi nước bắt đầu dâng');heading('Khi nước bắt đầu dâng','Bạn là người thiết kế tín hiệu cảnh báo cho một khu dân cư ven sông.','THỬ THÁCH 02 · KHOA HỌC & ĐỜI SỐNG');
pill(272,249,110,'LỚP 8–9','leaf');pill(398,249,190,'CẢM BIẾN & DỮ LIỆU','canvas');pill(604,249,150,'25–35 PHÚT','butter');
box(272,315,1120,286,'aqua',28);txt(304,346,610,'Cảnh báo sớm đến đâu là vừa?',28,'Bold');txt(304,410,600,'Quá muộn, người dân không kịp chuẩn bị. Quá sớm,\ntín hiệu có thể gây phiền. Hãy thử tìm một lựa chọn\nvà giải thích vì sao bạn tin vào nó.',17,'Regular','muted');landscape(1010,322,350,253);
txt(272,640,1100,'Ba chặng để tự tìm câu trả lời',24,'Bold');stepper(272,698,1100,['Đọc tình huống','Thiết lập & thử','Nhìn lại quyết định'],1);
[['01','Hiểu tín hiệu','Đọc dữ liệu mực nước\nvà giới hạn của cảm biến.','aqua'],['02','Tự chọn ngưỡng','Điều chỉnh, chạy thử\nvà quan sát hậu quả.','butter'],['03','Giải thích lựa chọn','So sánh các lần thử\nvà kể điều bạn nhận ra.','leaf']].forEach(([n,a,b,c],i)=>{const x=272+i*381;box(x,761,357,169,c,22);txt(x+24,781,305,n+' / '+a,18,'Bold');txt(x+24,829,305,b,14,'Regular','muted');});
txt(272,963,740,'Kiến thức nền: đọc số đo, so sánh ngưỡng và quan hệ nguyên nhân – kết quả.',13,'Regular','muted');btn(1083,957,'Bắt đầu trải nghiệm →','S07',309);

// S04: learning journey, with decisions and takeaways visible at each milestone.
begin('S04','Hành trình đang thành hình');heading('Hành trình đang thành hình','Những điều bạn đã thử, đã thay đổi và muốn hiểu thêm.');
stepper(272,253,1100,['Tín hiệu đầu tiên','Thử điều kiện mới','Nhìn lại','Chọn hướng tiếp'],1);
const history=[['HÔM NAY · ĐANG THỰC HIỆN','Khi nước bắt đầu dâng','Bạn đang kiểm tra ngưỡng cảnh báo 60 cm.','Tiếp tục trải nghiệm →','S08','canvas'],['HÔM QUA · ĐÃ PHẢN TƯ','Tín hiệu đầu tiên','“Em chọn ngưỡng thấp hơn để có thời gian chuẩn bị.”','Xem lại bằng chứng ↗','S11','leaf'],['TRƯỚC ĐÓ · CHỜ PHẢN TƯ','Ngân sách dự án học đường','Bạn đã cân nhắc giữa mua thiết bị và thuê ngắn hạn.','Viết phản tư →','S10','cream']];
history.forEach(([k,a,b,l,to,t],i)=>{const yy=326+i*211;box(272,yy+14,36,36,i===0?'yellow':'green',18);txt(272,yy+20,36,i===0?'1':'✓',14,'Bold','ink',{align:'CENTER'});if(i<2)box(289,yy+58,2,151,'sage',0);box(338,yy,1054,187,t,24);txt(366,yy+23,940,k,11,'Bold','muted',{letterSpacing:1});txt(366,yy+53,940,a,23,'Bold');txt(366,yy+101,920,b,15,'Regular','muted');link(366,yy+144,l,to,450);});
txt(272,991,870,'Bạn có thể thử lại. Mỗi trải nghiệm ghi nhận quá trình, không định nghĩa con người bạn.',13,'Regular','muted');

// S08: input, experiment, output. The scene is intentionally more restrained.
begin('S08','Không gian trải nghiệm','Student',false);box(0,0,1440,1080,'sky',0);box(0,0,1440,78,'aqua',0);sun(24,18,40);txt(79,22,190,'AI LifeLab',23,'Bold');link(287,25,'← Hành trình kịch bản','S06',300);txt(1130,27,280,'✓ Đã lưu tiến trình 14:32',13,'Medium','muted');
txt(28,105,1040,'Khi nước bắt đầu dâng',29,'Bold');stepper(28,163,1380,['Hiểu tình huống','Thiết lập & thử','Quan sát','Nhìn lại'],1);
box(24,230,283,792,'cream',24);pill(44,252,242,'01 / THIẾT LẬP ĐẦU VÀO','butter');txt(44,305,243,'Cảnh báo trước khi\nnước đạt 80 cm.',21,'Bold');txt(44,386,242,'Chọn ngưỡng đủ sớm để\nngười dân có thời gian chuẩn bị.',14,'Regular','muted');rule(44,464,242);
txt(44,492,242,'Ngưỡng cảnh báo',15,'Bold');txt(44,531,242,'60 cm',38,'Bold');box(44,602,242,7,'border',4);box(44,602,145,7,'forest',4);box(179,594,22,22,'yellow',11,'ink');txt(44,625,242,'20 cm                         100 cm',11,'Regular','muted');
txt(44,688,242,'Mực nước ban đầu',13,'Bold');txt(44,720,242,'45 cm',25,'Bold');txt(44,778,242,'Xu hướng mô phỏng',13,'Bold');pill(44,813,240,'ĐANG TĂNG DẦN','canvas');link(44,949,'Xem dữ liệu & điều kiện ↗','S07',250);
box(327,230,719,792,'aqua',24);pill(347,252,295,'02 / QUAN SÁT MÔ HÌNH','canvas');txt(347,305,650,'Khu dân cư ven sông',22,'Bold');landscape(347,342,680,425);
box(347,778,679,92,'canvas',17);txt(367,794,625,'Chưa chạy lần thử này',16,'Bold');txt(367,828,625,'Kết quả sẽ cho biết cảnh báo phát khi nào và điều gì xảy ra.',13,'Regular','muted');btn(347,924,'Chạy thử mô phỏng →','S09',295);link(750,936,'Đặt lại lựa chọn','S08',260);
box(1066,230,350,792,'mint',24);sun(1090,253,34);txt(1139,258,250,'AI Coach',21,'Bold');txt(1090,328,298,'Bạn dự đoán điều gì\nsẽ xảy ra ở 60 cm?',21,'SemiBold');txt(1090,419,298,'Cứ thử lựa chọn của mình trước.\nBạn có thể quay lại và đổi ngưỡng\nsau khi thấy kết quả.',15,'Regular','muted');
rule(1090,533,302);txt(1090,561,298,'Khi cần một gợi ý',14,'Bold');txt(1090,606,298,'Cảnh báo quá sớm và quá muộn\ncó thể dẫn đến điều gì khác nhau?',15,'Regular');btn(1090,709,'Cho mình một câu hỏi gợi ý','S08',302,'Secondary');input(1090,826,302,88,'Câu hỏi của bạn','Mình muốn hiểu rõ hơn về…','coach');

// S09: make the causal output visible, along with a restrained comparison chart.
begin('S09','Lựa chọn của bạn vừa tạo ra điều gì?');heading('Lựa chọn của bạn vừa tạo ra điều gì?','Lần thử 02 · Ngưỡng 60 cm · Dữ liệu mô phỏng minh họa');stepper(272,252,1100,['Hiểu tình huống','Thiết lập & thử','Quan sát','Nhìn lại'],2);
box(272,324,704,431,'aqua',28);pill(300,352,307,'CẢNH BÁO ĐÃ PHÁT Ở 60 CM','leaf');landscape(320,394,600,325,true);
box(1000,324,392,431,'cream',28);txt(1030,355,326,'Điều đã xảy ra',23,'Bold');fact(1030,415,'BẠN ĐÃ CHỌN','Ngưỡng 60 cm');fact(1030,524,'HỆ THỐNG PHẢN HỒI','Phát cảnh báo');txt(1030,635,326,'Tín hiệu xuất hiện trước ngưỡng\nnguy hiểm 80 cm. Bạn muốn kiểm tra\nthêm nguy cơ cảnh báo quá sớm?',14,'Regular','muted');
box(272,779,704,232,'mint',24);txt(302,806,640,'Hai lần thử, hai lựa chọn',21,'Bold');txt(302,853,640,'Lần 01: 75 cm                         Lần 02: 60 cm',15,'Bold');txt(302,896,640,'Lần này cảnh báo xuất hiện sớm hơn.\nĐó có luôn là một lựa chọn tốt hơn không?',15,'Regular','muted');link(302,963,'Thử một ngưỡng khác ↗','S08',450);
box(1000,779,392,232,'peach',24);txt(1030,808,326,'Bạn muốn làm gì tiếp?',21,'Bold');btn(1030,861,'Điều chỉnh và thử lại','S08',332,'Secondary');btn(1030,933,'Nhìn lại trải nghiệm →','S10',332);

// S10: a quieter journal, not a chat dashboard.
begin('S10','Dành một trang để nhìn lại.');heading('Dành một trang để nhìn lại.','Không cần một câu trả lời hoàn hảo. Hãy viết điều bạn thực sự nhận ra.','NHẬT KÝ TRẢI NGHIỆM / 02');
box(272,248,1120,108,'mint',20);txt(300,270,1060,'Bạn chọn 60 cm → Hệ thống phát cảnh báo → Có thời gian trước ngưỡng 80 cm',16,'Bold');link(300,316,'Mở lại kết quả mô phỏng ↗','S09',600);
box(272,386,744,624,'cream',26);input(304,419,680,150,'01. Vì sao bạn chọn ngưỡng này?','Em muốn cảnh báo đủ sớm để người dân chuẩn bị.\nEm cần thử thêm để biết có quá nhiều cảnh báo sai không.','reflection1');input(304,657,680,138,'02. Nếu thử lại, bạn muốn kiểm tra điều gì?','Em sẽ giữ nguyên điều kiện và so sánh ngưỡng 60 cm\nvới 70 cm để nhìn rõ sự khác biệt.','reflection2');btn(304,928,'Lưu & hoàn thành →','S11',268);link(686,941,'Quay lại thử thêm','S08',270);
txt(1050,405,310,'MỘT CÂU HỎI ĐỂ NGHĨ THÊM',11,'Bold','muted',{letterSpacing:1});sun(1050,458,45);txt(1050,535,305,'Điều gì trong kết quả\nkhiến bạn muốn giữ\nhoặc đổi lựa chọn?',23,'SemiBold');txt(1050,683,300,'Bạn có thể dựa vào thời điểm\ncảnh báo, mức nước và những\nđiều kiện chưa thử.',15,'Regular','muted');txt(1050,920,300,'✓ Bản nháp được lưu trên thiết bị.',12,'Regular','muted');

// T01: a deliberately structured teaching dashboard, with real table hierarchy.
begin('T01','Lớp học đang trải nghiệm thế nào?','Teacher');heading('Lớp học đang trải nghiệm thế nào?','Mở bằng chứng để hiểu quá trình, không chỉ nhìn số hoàn thành.','KHÔNG GIAN GIÁO VIÊN');btn(1130,132,'Giao nhiệm vụ mới →','T03',262);
[['Lớp 8A','Chọn lớp ▾'],['Kịch bản','Cảnh báo mực nước ▾'],['Trạng thái','Tất cả trạng thái ▾']].forEach(([a,b],i)=>{const x=272+i*381;txt(x,252,357,a,12,'Bold','muted');btn(x,282,b,'T01',357,'Secondary');});
box(272,354,1120,141,'aqua',22);fact(300,376,'ĐÃ THAM GIA','28 / 32');fact(665,376,'ĐÃ HOÀN THÀNH','18 học sinh');fact(1040,376,'CẦN TIẾP TỤC','10 học sinh');
txt(272,536,800,'Nhiệm vụ đang giao',24,'Bold');link(1210,542,'Xem tất cả ↗','T02',180);
box(272,589,1120,257,'canvas',22);txt(302,612,440,'NHIỆM VỤ / LỚP',11,'Bold','muted');txt(815,612,230,'HOÀN THÀNH',11,'Bold','muted');txt(1090,612,260,'THỜI HẠN',11,'Bold','muted');
[['Cảnh báo mực nước','Lớp 8A · 32 học sinh','18 / 32','05/11 · 17:00'],['Ngân sách dự án học đường','Lớp 9A · 30 học sinh','12 / 30','07/11 · 17:00']].forEach(([a,b,c,d],i)=>{const yy=657+i*86;rule(302,yy-7,1060);txt(302,yy+5,500,a,16,'Bold');txt(302,yy+36,500,b,12,'Regular','muted');txt(815,yy+16,220,c,17,'Bold');txt(1090,yy+18,230,d,13,'Regular','muted');link(1320,yy+16,'↗','T07',40);});
box(272,870,720,152,'cream',22);txt(302,894,650,'Điểm học sinh thường gặp khó',20,'Bold');txt(302,935,650,'6 em đang ở bước chọn ngưỡng · 4 em chưa hoàn thành phản tư.',14,'Regular','muted');link(302,979,'Xem phiên học liên quan ↗','T07',500);
box(1016,870,376,152,'mint',22);txt(1044,895,310,'Đọc suy nghĩ của học sinh',20,'Bold');link(1044,966,'Mở phản tư và tiêu chí ↗','T08',310);

// Mobile and tablet are authored reflows, not scaled screenshots.
const referenceLandscape=scenes.find(s=>s.code==='S08').nodes.find(n=>n.name==='Illustration / sensing neighbourhood');
for(const s of scenes)for(const n of s.nodes){if(n.type==='svg'&&n.name==='Illustration / bridge'){n.source=referenceLandscape.source;n.name='Illustration / sensing neighbourhood';}if(s.code==='H02'&&n.type==='text'&&n.value==='Mỗi trải nghiệm là\nmột cơ hội nhìn lại.')n.value='Điều gì khiến\nbạn muốn tìm hiểu thêm?';if(s.code==='H02'&&n.type==='text'&&n.value==='Thử một cách làm, quan sát hậu quả\nvà kể lại điều bạn vừa nhận ra.')n.value='Khám phá công việc và lĩnh vực\nbạn tò mò qua những tình huống nhỏ.';if(s.code==='T01'&&n.type==='text'&&n.value==='Đọc suy nghĩ của học sinh')n.value='Đọc phản tư học sinh';}
const responsiveCodes=['H01','S01','S06','S08','S09','S10','S04','T01'];
for(const code of responsiveCodes)for(const device of ['T','M']){
 const W=device==='M'?390:834,tablet=device==='T',P=tablet?32:20,CW=W-P*2;
 const base=scenes.find(s=>s.code===code);S={code:code+'-'+device,title:base.title+' · '+(tablet?'Tablet':'Mobile'),role:base.role,w:W,h:1600,nodes:[]};scenes.push(S);
 box(0,0,W,1900,'sky',0);box(0,0,W,76,'aqua',0);sun(P,19,34);txt(P+47,21,W-130,'AI LifeLab',20,'Bold');link(W-66,25,'☰',code,40);
 const route=c=>responsiveCodes.includes(c)?c+'-'+device:c;
 const fullbtn=(y,label,to)=>btn(P,y,label,route(to),CW);
 const title=(value,sub)=>{txt(P,111,CW,value,tablet?36:29,'Bold');txt(P,tablet?181:214,CW,sub,15,'Regular','muted');};
 let bottom=1400;
 if(code==='H01'){
  pill(P,105,258,'HỌC QUA NHỮNG LẦN TỰ THỬ','leaf');txt(P,165,CW,'Thế giới thật.\nLựa chọn của bạn.',tablet?50:37,'Bold');txt(P,tablet?334:299,CW,'Tự quyết định. Thấy kết quả.\nHiểu thêm về cách mình nghĩ.',16,'Regular','muted');fullbtn(tablet?414:381,'Khám phá trải nghiệm','S06');
  box(P,tablet?496:465,CW,tablet?420:293,'aqua',28);landscape(P+4,tablet?500:475,CW-8,tablet?402:270);
  const y=tablet?955:800;txt(P,y,CW,'Bạn muốn thử điều gì?',26,'Bold');entry(P,y+66,CW,'Khi nước bắt đầu dâng','Cảm biến · Lớp 8–9',route('S06'),'canvas');entry(P,y+180,CW,'Ngân sách dự án','Tài chính cá nhân',route('S06'),'butter');entry(P,y+294,CW,'Khu phố xanh hơn','Quy hoạch bền vững',route('S06'),'peach');bottom=y+425;
 }else if(code==='S01'){
  title('Chào Minh Anh,\nhôm nay thử gì?','Một bước khám phá của riêng bạn.');
  box(P,294,CW,tablet?410:378,'canvas',26);pill(P+22,316,208,'TIẾP TỤC KHÁM PHÁ','butter');txt(P+22,369,CW-44,'Khi nước bắt đầu dâng',tablet?30:23,'Bold');txt(P+22,421,CW-44,'Bạn đang chọn ngưỡng cảnh báo.',14,'Regular','muted');landscape(P+CW*.37,446,CW*.61,tablet?180:135);btn(P+22,tablet?625:593,'Tiếp tục trải nghiệm →',route('S08'),CW-44);
  const y=tablet?745:710;txt(P,y,CW,'Hành trình gần đây',24,'Bold');entry(P,y+58,CW,'Tín hiệu đầu tiên','Đã thử 2 ngưỡng cảnh báo',route('S04'),'leaf');entry(P,y+171,CW,'Ngân sách dự án','Còn một bước phản tư',route('S10'),'cream');box(P,y+290,CW,180,'peach',22);txt(P+22,y+313,CW-44,'Một mục tiêu nhỏ',21,'Bold');txt(P+22,y+356,CW-44,'Giải thích lựa chọn bằng điều mình thấy.',14,'Regular','muted');link(P+22,y+409,'Mở hành trình của mình ↗',route('S04'),CW-44);bottom=y+510;
 }else if(code==='S06'){
  title('Khi nước\nbắt đầu dâng','Khoa học & đời sống · Lớp 8–9');landscape(P,281,CW,tablet?380:240);let y=tablet?702:563;txt(P,y,CW,'Cảnh báo sớm đến đâu là vừa?',tablet?29:24,'Bold');txt(P,y+86,CW,'Quá muộn thì không kịp chuẩn bị.\nQuá sớm có thể gây phiền. Bạn sẽ chọn gì?',15,'Regular','muted');
  [['01','Đọc tình huống','Hiểu dữ liệu và điều kiện.'],['02','Thiết lập & thử','Chọn ngưỡng rồi chạy mô phỏng.'],['03','Nhìn lại quyết định','So sánh và giải thích lựa chọn.']].forEach(([n,a,b],i)=>entry(P,y+174+i*113,CW,n+' / '+a,b,route('S08'),i===1?'butter':'aqua'));
  fullbtn(y+537,'Bắt đầu trải nghiệm →','S08');bottom=y+625;
 }else if(code==='S08'){
  title('Thiết lập & thử','Bước 2 / 4 · Cảnh báo mực nước');pill(P,274,CW,'MỤC TIÊU: CẢNH BÁO TRƯỚC 80 CM','butter');
  box(P,328,CW,tablet?425:273,'aqua',24);landscape(P+3,343,CW-6,tablet?390:240);
  let y=tablet?785:634;box(P,y,CW,239,'cream',22);txt(P+22,y+21,CW-44,'Ngưỡng cảnh báo',18,'Bold');txt(P+22,y+64,CW-44,'60 cm',34,'Bold');box(P+22,y+140,CW-44,7,'border',4);box(P+22,y+140,(CW-44)*.6,7,'forest',4);box(P+22+(CW-44)*.6-10,y+132,22,22,'yellow',11);txt(P+22,y+179,CW-44,'Mực nước đầu: 45 cm · Đang tăng',14,'Regular','muted');
  fullbtn(y+263,'Chạy thử mô phỏng →','S09');box(P,y+337,CW,142,'mint',22);txt(P+22,y+361,CW-44,'AI Coach · Mở gợi ý ⌄',17,'Bold');txt(P+22,y+406,CW-44,'Bạn nghĩ điều gì sẽ xảy ra ở 60 cm?',14,'Regular','muted');link(P,y+517,'← Xem lại tình huống',route('S06'),CW);bottom=y+590;
 }else if(code==='S09'){
  title('Lựa chọn tạo ra\nđiều gì?','Bước 3 / 4 · Lần thử 02');pill(P,274,CW,'CẢNH BÁO ĐÃ PHÁT Ở 60 CM','leaf');landscape(P,326,CW,tablet?398:245,true);
  let y=tablet?770:610;box(P,y,CW,270,'cream',22);txt(P+22,y+23,CW-44,'Tín hiệu xuất hiện sớm hơn.',22,'Bold');txt(P+22,y+94,CW-44,'Bạn chọn 60 cm thay cho 75 cm.\nHệ thống cảnh báo trước ngưỡng 80 cm.\nCảnh báo sớm hơn có luôn tốt hơn?',15,'Regular','muted');link(P+22,y+218,'So sánh với lần thử trước ↗',route('S08'),CW-44);fullbtn(y+300,'Nhìn lại trải nghiệm →','S10');btn(P,y+368,'Điều chỉnh và thử lại',route('S08'),CW,'Secondary');bottom=y+460;
 }else if(code==='S10'){
  title('Một trang\nđể nhìn lại.','Bạn có thể viết theo cách của mình.');box(P,286,CW,147,'mint',22);txt(P+20,307,CW-40,'Bạn chọn 60 cm.\nCảnh báo phát trước mức 80 cm.',16,'Bold');link(P+20,388,'Mở lại kết quả ↗',route('S09'),CW-40);
  input(P,473,CW,176,'01. Vì sao bạn chọn ngưỡng này?','Em muốn có thời gian chuẩn bị…','reflection1');input(P,736,CW,166,'02. Nếu thử lại, bạn sẽ kiểm tra gì?','Em sẽ thử ngưỡng 70 cm để so sánh…','reflection2');fullbtn(1000,'Lưu & hoàn thành →','S04');link(P,1081,'Quay lại thử thêm',route('S08'),CW);txt(P,1150,CW,'✓ Bản nháp được lưu trên thiết bị.',12,'Regular','muted');bottom=1210;
 }else if(code==='S04'){
  title('Hành trình\nđang thành hình','Những lựa chọn, thay đổi và điều bạn học.');
  [['Hôm nay','Khi nước bắt đầu dâng','Đang thử ngưỡng cảnh báo 60 cm.','S08','canvas'],['Hôm qua','Tín hiệu đầu tiên','Em muốn cảnh báo sớm để chuẩn bị.','S09','leaf'],['Trước đó','Ngân sách dự án','Còn một bước nhìn lại quyết định.','S10','cream']].forEach(([t,a,b,to,c],i)=>{const y=303+i*263;txt(P,y,CW,t.toUpperCase(),12,'Bold','muted');box(P,y+41,CW,194,c,22);txt(P+20,y+63,CW-40,a,22,'Bold');txt(P+20,y+126,CW-40,b,14,'Regular','muted');link(P+20,y+182,'Mở trải nghiệm ↗',route(to),CW-40);});
  txt(P,1127,CW,'Phát triển là một quá trình.\nBạn luôn có thể thử một cách khác.',16,'Regular','muted');bottom=1230;
 }else if(code==='T01'){
  title('Lớp đang trải nghiệm\nthế nào?','Lớp 8A · Cảnh báo mực nước');btn(P,281,'Lớp 8A ▾','T01',CW,'Secondary');box(P,357,CW,174,'aqua',22);txt(P+22,379,CW-44,'28/32 đã tham gia',23,'Bold');txt(P+22,428,CW-44,'18 hoàn thành · 10 đang thực hiện',14,'Regular','muted');box(P+22,483,CW-44,7,'sage',4);box(P+22,483,(CW-44)*.56,7,'green',4);
  txt(P,578,CW,'Nhiệm vụ đang giao',24,'Bold');entry(P,640,CW,'Cảnh báo mực nước','Lớp 8A · 18/32 hoàn thành','T07','canvas');entry(P,755,CW,'Ngân sách dự án','Lớp 9A · 12/30 hoàn thành','T07','aqua');box(P,891,CW,195,'cream',22);txt(P+22,917,CW-44,'Điểm cần hỗ trợ',21,'Bold');txt(P+22,967,CW-44,'6 em ở bước chọn ngưỡng.\n4 em chưa hoàn thành phản tư.',15,'Regular','muted');link(P+22,1041,'Mở phiên học ↗','T08',CW-44);fullbtn(1125,'Giao nhiệm vụ mới →','T01');bottom=1225;
 }
 S.h=bottom;S.nodes[0].h=bottom;
}
};
