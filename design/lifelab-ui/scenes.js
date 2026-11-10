/* AI LifeLab: shared, editable scene source for HTML review and Figma import. */
const fs=require('fs');
const path=require('path');
const C={sky:'#F4FAFF',cream:'#FFF7E6',mint:'#E8F8F1',forest:'#245C49',ink:'#213E36',muted:'#61756D',border:'#D8E7DF',canvas:'#FCFDF9',sage:'#B8DCCB',blue:'#527E9C',ochre:'#9D742E',red:'#A04F43'};
const scenes=[];let S;
function add(n){S.nodes.push(n);return n;}
function box(x,y,w,h,fill='canvas',radius=24,stroke=null){return add({type:'box',x,y,w,h,fill,radius,stroke});}
function text(x,y,w,value,size=16,style='Regular',fill='ink',extra={}){return add({type:'text',x,y,w,h:Math.ceil(size*1.52*(value.split('\n').length)),value,size,style,fill,...extra});}
function line(x,y,w,fill='border'){return box(x,y,w,1,fill,0);}
function svg(x,y,w,h,source,name){return add({type:'svg',x,y,w,h,source,name});}
function button(x,y,label,to,kind='Primary',w=200){return add({type:'button',x,y,w,h:48,label,to,kind});}
function pill(x,y,label,tone='mint',w){const width=w||label.length*7.5+26;box(x,y,width,30,tone,15);text(x+13,y+5,width-20,label,12,'Medium',tone==='cream'?'ochre':'forest');return width;}
function link(x,y,label,to,w=230){return add({type:'link',x,y,w,h:30,label,to});}
function input(x,y,w,h,label,value,field,options={}){text(x,y,w,label,13,'Medium','muted');box(x,y+29,w,h,'canvas',12,'border');add({type:'input',x:x+16,y:y+42,w:w-32,h:h-25,value,field,multiline:h>70,...options});}
function progress(x,y,w,p,tone='forest'){box(x,y,w,7,'border',4);box(x,y,Math.max(7,w*p),7,tone,4);}
function groupTitle(x,y,w,kicker,title,sub){text(x,y,w,kicker.toUpperCase(),11,'SemiBold','muted',{letterSpacing:1.5});text(x,y+25,w,title,34,'Bold');if(sub)text(x,y+80,w,sub,14,'Regular','muted');}
const paths={
 leaf:'M12 20V10m0 4C5 14 3 9 4 4c6 0 9 3 8 10Zm0-2c0-6 4-8 9-7 0 5-3 8-9 7Z',
 home:'m3 10 9-7 9 7v10H3Zm6 10v-7h6v7',
 compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 8l-3 6-5 2 2-5Z',
 book:'M3 5h7l2 2 2-2h7v15h-7l-2 2-2-2H3Zm9 2v15',
 chart:'M4 20V4m0 16h17M8 16v-5m5 5V6m5 10v-8',
 target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-4 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5-1v2',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l4 2',
 check:'m5 12 4 4L19 6',
 arrow:'M4 12h15m-6-6 6 6-6 6',
 users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m18 0v-3a4 4 0 0 0-3-4M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3a4 4 0 0 1 0 8',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
 camera:'M3 6h4l2-3h6l2 3h4v14H3Zm13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 search:'M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 7',
 flag:'M5 22V3h13l-3 5 3 5H5',
 save:'M4 3h14l3 3v15H3V3Zm3 0v7h10V3M7 21v-7h10v7',
 undo:'M8 4 3 9l5 5M3 9h11a7 7 0 0 1 7 7',
 chat:'M3 4h18v13H9l-6 5Zm4 5h10M7 13h6'
};
function icon(x,y,name,size=22,fill='forest'){svg(x,y,size,size,`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="${paths[name]||paths.spark}" stroke="${C[fill]||fill}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg>`,name);}
function bridgeArt(x,y,w,h,variant='normal'){
 const red=variant==='load';const source=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 350" fill="none">
 <ellipse cx="310" cy="286" rx="244" ry="30" fill="#B8DCCB" opacity=".35"/><path d="M30 282c75-30 128 31 204 7s149-27 216-4 94 4 133-10" stroke="#A4CDE1" stroke-width="22" stroke-linecap="round"/>
 <path d="M44 244h510" stroke="#245C49" stroke-width="13" stroke-linecap="round"/><path d="M66 244v53m461-53v53" stroke="#527E9C" stroke-width="19"/>
 <path d="m66 235 82-128 91 128 90-128 94 128 104-128M66 235h461M148 107h379M148 107l91 128 90-128 94 128 104-128" stroke="${red?'#A04F43':'#245C49'}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M148 107v128m91-128v128m90-128v128m94-128v128" stroke="#78AF94" stroke-width="4"/>
 ${[66,148,239,329,423,527].map((v,i)=>`<circle cx="${v}" cy="${i%2?107:235}" r="8" fill="#FFF7E6" stroke="#245C49" stroke-width="3"/>`).join('')}
 <rect x="259" y="189" width="79" height="43" rx="10" fill="#E4B465"/><path d="M274 202h49m-24-55v33m-10-11 10 11 10-11" stroke="#9D742E" stroke-width="3" stroke-linecap="round"/>
 <circle cx="480" cy="58" r="26" fill="#FFF7E6"/><path d="M468 58h24m-12-12v24" stroke="#9D742E" stroke-width="2"/>
 <path d="m40 187 6-9 5 9m489-35 8-12 8 12" stroke="#527E9C" stroke-width="2"/>
 </svg>`;svg(x,y,w,h,source,'Illustration / bridge');
}
function cityArt(x,y,w,h){svg(x,y,w,h,`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 520 260"><path d="M10 201q80-36 155-4t155 0 190-9" fill="none" stroke="#BAD9E8" stroke-width="45"/><path d="m65 185 55-90 65 90Zm150 0V93h60v92Zm95 0V55h65v130Zm105 0v-60h45v60" fill="#E8F8F1" stroke="#245C49" stroke-width="3"/><path d="M99 185v-47h40v47m93-73h27m-27 22h27m70-61h27m-27 23h27m-27 23h27m-27 23h27m86 1h21" fill="none" stroke="#78AF94" stroke-width="4"/><circle cx="430" cy="61" r="27" fill="#E4B465"/><path d="M52 220h420" stroke="#527E9C" stroke-dasharray="6 9" stroke-width="2"/></svg>`,'Illustration / town');}
function financeArt(x,y,w,h){svg(x,y,w,h,`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 400 250"><ellipse cx="210" cy="222" rx="150" ry="13" fill="#B8DCCB" opacity=".45"/><rect x="71" y="59" width="242" height="142" rx="25" fill="#B8DCCB" stroke="#245C49" stroke-width="3"/><path d="M71 96h242" stroke="#245C49" stroke-width="3"/><rect x="251" y="114" width="89" height="56" rx="16" fill="#FFF7E6" stroke="#245C49" stroke-width="3"/><circle cx="274" cy="142" r="6" fill="#245C49"/><circle cx="125" cy="51" r="36" fill="#E4B465" stroke="#9D742E" stroke-width="3"/><path d="M125 29v44m13-32c-25-16-35 18-9 13s14 26-9 12" fill="none" stroke="#9D742E" stroke-width="3"/><path d="m327 62 9-17 9 17-9 17Z" fill="#F4FAFF" stroke="#527E9C" stroke-width="2"/></svg>`,'Illustration / budget');}
function sproutArt(x,y,w,h){svg(x,y,w,h,`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 340 280"><ellipse cx="165" cy="241" rx="128" ry="20" fill="#B8DCCB" opacity=".5"/><path d="M163 224V92" stroke="#245C49" stroke-width="5"/><path d="M162 164c-70 0-87-42-81-84 57-4 87 23 81 84Z" fill="#B8DCCB" stroke="#245C49" stroke-width="3"/><path d="M164 126c0-64 35-83 86-76 3 49-30 79-86 76Z" fill="#E8F8F1" stroke="#245C49" stroke-width="3"/><path d="m164 164-49-47m49 9 52-48" stroke="#78AF94" stroke-width="3"/><path d="M113 213h100l-15 39h-70Z" fill="#E4B465" stroke="#9D742E" stroke-width="3"/><circle cx="69" cy="46" r="16" fill="#FFF7E6"/><path d="m277 145 6-12 6 12-6 12Z" fill="#F4FAFF" stroke="#527E9C" stroke-width="2"/></svg>`,'Illustration / growth');}
function avatar(x,y,name='MA',tone='mint',size=40){box(x,y,size,size,tone,size/2);text(x,y+size*.23,size,name,Math.round(size*.32),'SemiBold','forest',{align:'CENTER'});}
function metric(x,y,label,value,sub){text(x,y,220,label,12,'Medium','muted');text(x,y+25,220,value,32,'Bold','ink',{family:'Manrope'});if(sub)text(x,y+75,220,sub,12,'Regular','muted');}
function rowItem(x,y,w,title,sub,to,tag){line(x,y,w);text(x,y+19,w-200,title,15,'SemiBold');text(x,y+46,w-200,sub,12,'Regular','muted');if(tag)pill(x+w-175,y+21,tag,'mint',142);if(to)link(x+w-35,y+26,'↗',to,30);}
function stepper(x,y,w,labels,active){const each=w/labels.length;for(let i=0;i<labels.length;i++){if(i<labels.length-1)box(x+i*each+each-70,y+15,66,2,i<active?'sage':'border',0);box(x+i*each,y,32,32,i<=active?'forest':'mint',16);text(x+i*each,y+5,32,i<active?'✓':String(i+1),12,'Medium',i<=active?'canvas':'muted',{align:'CENTER'});text(x+i*each+42,y+5,each-116,labels[i],12,i===active?'SemiBold':'Regular',i===active?'forest':'muted');}}
function topnav(){box(0,0,1440,88,'canvas',0);line(48,87,1344);box(48,23,42,42,'forest',14);icon(58,33,'leaf',22,'canvas');text(103,30,190,'AI LifeLab',22,'Bold');link(480,34,'Trang chủ','H01',110);link(620,34,'Khám phá','H02',120);link(760,34,'Cách trải nghiệm','H03',180);link(1010,34,'Dành cho giáo viên','T01',175);button(1200,20,'Vào LifeLab →','S01','Primary',190);}
const studentNav=[['home','Góc của mình','S01'],['compass','Thư viện trải nghiệm','S05'],['book','Trải nghiệm của mình','S04'],['chart','Hồ sơ năng lực','S02'],['target','Mục tiêu cá nhân','S03']];
const teacherNav=[['home','Tổng quan','T01'],['users','Lớp & nhiệm vụ','T02'],['book','Thư viện hoạt động','T03']];
function shell(active,role='Student'){
 box(0,0,1440,1080,'sky',0);box(0,0,232,1080,'canvas',0);box(28,28,40,40,'forest',13);icon(37,37,'leaf',22,'canvas');text(80,31,150,'AI LifeLab',21,'Bold');text(28,105,180,role==='Student'?'GÓC KHÁM PHÁ':'KHÔNG GIAN GIÁO VIÊN',10,'SemiBold','muted',{letterSpacing:1.1});
 const nav=role==='Student'?studentNav:teacherNav;
 nav.forEach(([ic,label,to],i)=>{const selected=to===active;const yy=145+i*58;if(selected)box(16,yy-8,200,48,'mint',12);icon(29,yy+5,ic,20,selected?'forest':'muted');add({type:'link',x:60,y:yy+3,w:155,h:32,label,to,size:13,selected});});
 box(20,role==='Student'?520:410,192,188,'cream',20);icon(36,role==='Student'?540:430,'spark');text(36,role==='Student'?578:468,158,role==='Student'?'Mỗi lần thử,\nmột điều mới.':'Dạy bằng trải nghiệm.',15,'SemiBold');text(36,role==='Student'?634:520,155,role==='Student'?'Bạn có thể bắt đầu nhỏ.':'Chọn kịch bản có sẵn\nvà giao cho lớp.',12,'Regular','muted');link(36,role==='Student'?670:560,'Xem hướng dẫn ↗','H03',155);
 line(24,974,184);avatar(24,996,role==='Student'?'MA':'CL');text(76,996,140,role==='Student'?'Minh Anh':'Cô Lan',13,'SemiBold');text(76,1018,140,role==='Student'?'Học sinh · Lớp 8A':'Giáo viên',11,'Regular','muted');
 box(232,0,1208,80,'canvas',0);text(272,28,400,role==='Student'?'Không gian của Minh Anh':'Không gian giảng dạy',13,'Regular','muted');link(1090,27,role==='Student'?'Khu vực giáo viên ↗':'Góc học sinh ↗',role==='Student'?'T01':'S01',200);avatar(1350,19,role==='Student'?'MA':'CL','cream');
}
function page(code,title,active,role='Student',sub='') {S={code,title,role,w:1440,h:1080,nodes:[]};scenes.push(S);shell(active,role);groupTitle(272,112,1100,role==='Teacher'?'Dạy học qua trải nghiệm':'Tự thử · Tự khám phá',title,sub);return S;}
function home(code,title){S={code,title,role:'Home',w:1440,h:1080,nodes:[]};scenes.push(S);topnav();}
function scenario(x,y,w,h,title,sub,tone,art,to,status=''){box(x,y,w,h,tone,24);pill(x+24,y+24,sub,tone==='cream'?'canvas':'cream',180);if(status)pill(x+w-175,y+24,status,'canvas',150);text(x+28,y+82,w-56,title,26,'Bold');const small=w<500;text(x+28,y+(small?177:154),small?w-56:w*.46,small?'Lập kế hoạch và cân nhắc nguồn lực.':'Tự thiết kế, quan sát và tìm cách làm tốt hơn.',13,'Regular','muted');if(art==='bridge')bridgeArt(x+w*.44,y+h-230,w*.53,210);else if(art==='city')cityArt(x+w*.42,y+h-220,w*.55,190);else financeArt(x+w-170,y+h-163,150,130);button(x+28,y+h-76,'Khám phá →',to,'Primary',174);}
function bullet(x,y,w,heading,body,ic='check'){icon(x,y+2,ic,20);text(x+32,y,w-32,heading,15,'SemiBold');text(x+32,y+29,w-32,body,13,'Regular','muted');}

// HOME: editorial bento and a linear introduction journey.
home('H01','Trang chủ');
pill(64,130,'PHÒNG THỰC HÀNH CỦA BẠN','mint',258);
text(64,194,660,'Thử điều mới.\nHiểu mình hơn.',58,'Bold');
text(68,398,550,'Một cây cầu, một quyết định, một cách nghĩ mới.\nTự tay trải nghiệm những điều khó làm ngoài đời.',17,'Regular','muted');
button(68,495,'Bắt đầu khám phá →','H02','Primary',240);link(336,508,'LifeLab hoạt động thế nào?','H03',300);
box(774,128,602,432,'sky',32);pill(802,154,'TRẢI NGHIỆM NỔI BẬT','canvas',211);bridgeArt(796,192,548,310);box(1080,464,260,66,'canvas',16);icon(1096,484,'check');text(1127,477,196,'Ý tưởng của bạn có thể\ntrở thành một cây cầu.',12,'Medium');
text(68,602,1000,'Hôm nay, bạn muốn thử điều gì?',28,'Bold');link(1165,609,'Xem tất cả ↗','H02',180);
box(64,664,642,288,'mint',28);text(92,694,360,'Xây dựng & thử nghiệm',25,'Bold');text(92,742,315,'Tìm hiểu lực, kết cấu và những\nđiều làm một ý tưởng đứng vững.',14,'Regular','muted');bridgeArt(385,704,300,180);button(92,865,'Vào phòng STEM →','H02','Secondary',220);
box(730,664,310,288,'cream',28);icon(758,694,'target',28);text(758,752,250,'Quyết định\ncó cân nhắc',23,'Bold');link(758,888,'Khám phá đời sống →','H02',250);
box(1064,664,312,288,'sky',28);text(1092,694,250,'Bạn làm chủ\nhành trình.',23,'Bold');text(1092,783,240,'Thử → Quan sát → Thử lại\nMỗi bước đều được lưu.',14,'Regular','muted');link(1092,888,'Xem cách bắt đầu ↗','H03',250);
text(68,1007,900,'Dành cho lớp 8–9 · Học bằng trải nghiệm · AI gợi mở, bạn tự quyết định',12,'Regular','muted');

home('H02','Khám phá kịch bản');groupTitle(64,128,1250,'Bắt đầu từ sự tò mò','Một thế giới để bạn thử.','Chọn điều bạn muốn tìm hiểu. Không cần biết hết trước khi bắt đầu.');
box(64,260,750,50,'sky',14,'border');icon(82,275,'search',20);text(116,274,650,'Tìm theo chủ đề, kiến thức hoặc tên trải nghiệm',14,'Regular','muted');
button(840,260,'Tất cả khối lớp','H02','Secondary',180);button(1038,260,'Lớp 8','S05','Ghost',140);button(1196,260,'Lớp 9','S05','Ghost',140);
scenario(64,342,832,365,'Cây cầu từ ý tưởng của bạn','STEM · LỚP 8 · 30 PHÚT','mint','bridge','S06');
scenario(920,342,456,365,'Ngân sách\ndự án học đường','ĐỜI SỐNG · LỚP 8–9','cream','finance','S06');
scenario(64,731,832,285,'Khi thành phố ngập nước','KHOA HỌC · LỚP 9','sky','city','S06');
box(920,731,456,285,'mint',24);text(948,765,380,'Mỗi trải nghiệm là\nmột cơ hội nhìn lại.',25,'Bold');text(948,861,380,'Thử một cách làm, quan sát hậu quả\nvà kể lại điều bạn vừa nhận ra.',14,'Regular','muted');link(948,956,'Xem hướng dẫn ↗','H03',250);

home('H03','Giới thiệu và hướng dẫn');groupTitle(64,125,1240,'Hành trình khám phá','Bạn thử. LifeLab đồng hành.','Một vòng trải nghiệm nhỏ có thể mở ra một cách nghĩ mới.');
const intro=[['Hiểu nhiệm vụ','Đọc bối cảnh và xem tài nguyên bạn có.'],['Tự thực hiện','Chọn phương án, thay đổi thông số, lắp ráp ý tưởng.'],['Quan sát kết quả','Nhìn điều gì thay đổi sau quyết định của bạn.'],['Thử một cách khác','Quay lại, điều chỉnh và so sánh với lần trước.'],['Nhìn lại chính mình','Giải thích điều vừa học và chọn mục tiêu tiếp theo.']];
intro.forEach(([a,b],i)=>{const yy=275+i*133;if(i<4)box(86,yy+43,2,88,'sage',0);box(64,yy,46,46,i===0?'forest':'mint',23);text(64,yy+11,46,String(i+1),16,'SemiBold',i===0?'canvas':'forest',{align:'CENTER'});text(144,yy,660,a,23,'SemiBold');text(144,yy+45,660,b,15,'Regular','muted');});
box(920,270,456,380,'cream',28);text(952,303,390,'Chuẩn bị thật đơn giản',25,'Bold');bullet(952,365,365,'Laptop và kết nối mạng','Dùng chuột hoặc bàn phím để thao tác.','book');bullet(952,453,365,'Camera khi bạn muốn','Chỉ bật ở bài hỗ trợ cử chỉ hoặc bản vẽ.','camera');link(952,582,'Khám phá trải nghiệm ↗','H02',330);
box(920,674,456,260,'mint',28);icon(952,706,'spark',28);text(952,754,380,'AI Coach sẽ không làm hộ.',22,'SemiBold');text(952,803,370,'Coach gợi ý bằng câu hỏi,\nđể bạn tự tìm ra cách tiếp theo.',15,'Regular','muted');button(952,865,'Mình sẵn sàng →','S01','Primary',230);

// STUDENT: a personal bento dashboard.
page('S01','Chào Minh Anh, thử tiếp nhé!','S01','Student','Mỗi lần thử là một bước hiểu thêm về cách bạn suy nghĩ.');
box(272,248,704,340,'cream',28);pill(300,276,'ĐANG THỰC HIỆN','canvas',170);text(300,330,360,'Ý tưởng cây cầu\ncủa bạn đang chờ.',30,'Bold');text(300,430,350,'Thử thách 02 · Tối ưu kết cấu\nĐã lưu ở bước thiết kế.',14,'Regular','muted');bridgeArt(650,340,300,180);button(300,510,'Tiếp tục trải nghiệm →','S08','Primary',250);
box(1000,248,392,340,'mint',28);icon(1028,278,'target',28);text(1028,330,320,'Một mục tiêu nhỏ',22,'SemiBold');text(1028,376,318,'Giải thích lý do trước khi\nthử một phương án mới.',17,'Regular');progress(1028,463,330,.33);text(1028,484,330,'Đã ghi nhận ở 1/3 trải nghiệm',12,'Regular','muted');link(1028,533,'Xem mục tiêu ↗','S03',280);
text(272,626,690,'Hành trình gần đây',23,'SemiBold');link(783,632,'Xem tất cả ↗','S04',200);
rowItem(272,680,704,'Cây cầu đầu tiên','Hoàn thành · Bạn đã thử 2 phương án','S11','Đã phản tư');rowItem(272,771,704,'Ngân sách dự án học đường','Kết quả đã lưu · Còn một bước nhìn lại','S10','Chờ phản tư');rowItem(272,862,704,'Tối ưu kết cấu','Lần thử gần nhất: hôm nay lúc 14:32','S08','Đang thực hiện');
box(1000,612,392,345,'sky',28,'border');sproutArt(1212,700,152,148);text(1028,642,320,'Điều đang lớn lên',22,'SemiBold');text(1028,694,245,'Bạn đã điều chỉnh\nsau khi quan sát kết quả.',16,'Regular');text(1028,799,320,'Bằng chứng: thiết kế cầu, lần thử 01 → 02',12,'Regular','muted');link(1028,891,'Mở hồ sơ năng lực ↗','S02',320);

page('S02','Nhìn lại điều mình đang học','S02','Student','Biểu hiện qua trải nghiệm, cùng những bằng chứng bạn có thể xem lại.');
box(272,248,704,360,'mint',28);pill(300,276,'HỒ SƠ CỦA MINH ANH','canvas',214);text(300,332,500,'Tiến bộ có dấu vết.',29,'Bold');const skills=[['Cân nhắc phương án',.74,'Có bằng chứng trong 3 phiên'],['Điều chỉnh sau quan sát',.56,'Có bằng chứng trong 2 phiên'],['Giải thích bằng dữ kiện',.28,'Cần thêm quan sát']];skills.forEach(([a,p,s],i)=>{const y=399+i*65;text(300,y,360,a,14,'Medium');text(700,y,250,s,11,'Regular','muted');progress(300,y+30,648,p);});
box(1000,248,392,360,'cream',28);text(1028,280,320,'Một nhận xét có cơ sở',22,'SemiBold');text(1028,344,320,'“Bạn đã thêm thanh giằng\nsau khi quan sát độ võng.”',19,'Medium');text(1028,438,320,'Thiết kế cầu · Lần thử 01 → 02\nNhận xét chỉ phản ánh phiên học này.',12,'Regular','muted');button(1028,526,'Xem bằng chứng','S09','Secondary',235);
text(272,650,800,'Tiến trình của mình',24,'SemiBold');stepper(272,709,1090,['Cây cầu đầu tiên','Tối ưu kết cấu','Điều kiện mới','Trải nghiệm tiếp'],1);
box(272,791,550,189,'sky',24,'border');text(300,819,490,'Không cần giống bất kỳ ai.',21,'SemiBold');text(300,864,485,'Hồ sơ giúp bạn nhìn lại quá trình của mình.\nKhi chưa đủ bằng chứng, LifeLab sẽ nói rõ.',14,'Regular','muted');
box(846,791,546,189,'mint',24);text(874,819,470,'Bạn muốn luyện điều gì tiếp?',21,'SemiBold');text(874,864,450,'Chọn một mục tiêu nhỏ cho lần thử tới.',14,'Regular','muted');link(874,924,'Đặt mục tiêu ↗','S03',300);

page('S03','Một mục tiêu nhỏ, một bước mới','S03','Student','Chọn điều bạn muốn luyện trong các trải nghiệm sắp tới.');
stepper(272,255,1100,['Chọn điều muốn luyện','Xác định dấu hiệu','Theo dõi qua trải nghiệm'],0);
box(272,329,704,570,'canvas',28);text(304,363,620,'Mình muốn luyện…',25,'Bold');
[['Giải thích quyết định bằng dữ kiện','Ví dụ: chỉ ra kết quả khiến mình đổi phương án.','mint'],['So sánh trước khi lựa chọn','Ví dụ: cân nhắc hai cách làm và lý do chọn.','sky'],['Nhìn lại sau khi thử','Ví dụ: kể điều mình sẽ làm khác ở lần tới.','cream']].forEach(([a,b,t],i)=>{const yy=430+i*118;box(304,yy,640,96,t,16,i===0?'forest':'border');icon(324,yy+22,i===0?'check':'target',21);text(360,yy+19,560,a,16,'SemiBold');text(360,yy+53,550,b,12,'Regular','muted');});button(304,818,'Lưu mục tiêu của mình →','S01','Primary',280);
box(1000,329,392,570,'cream',28);text(1032,363,320,'Mục tiêu đang theo đuổi',21,'SemiBold');sproutArt(1068,415,255,215);text(1032,654,320,'Giải thích lý do trước khi thử.',17,'Medium');progress(1032,723,328,.33);text(1032,748,320,'1/3 trải nghiệm đã ghi nhận',13,'Regular','muted');text(1032,805,320,'Bạn có thể điều chỉnh mục tiêu\nkhi hiểu rõ mình hơn.',13,'Regular','muted');

page('S04','Những trải nghiệm của mình','S04','Student','Tiếp tục từ nơi bạn dừng, hoặc nhìn lại một ý tưởng đã thử.');
pill(272,250,'Tất cả','forest',86);text(285,255,70,'Tất cả',12,'Medium','canvas');link(388,255,'Đang thực hiện','S08',170);link(589,255,'Chờ phản tư','S10',160);link(772,255,'Đã hoàn thành','S11',180);
box(272,320,1120,257,'cream',28);bridgeArt(980,345,350,210);pill(304,348,'ĐANG THỰC HIỆN','canvas',177);text(304,398,660,'Tối ưu kết cấu cây cầu',27,'Bold');text(304,448,620,'Thử thách 02/03 · Đã lưu ở bước thiết kế lúc 14:32',14,'Regular','muted');button(304,497,'Tiếp tục →','S08','Primary',190);
box(272,601,548,325,'sky',28);financeArt(578,649,208,140);pill(300,629,'CHỜ PHẢN TƯ','cream',165);text(300,684,390,'Ngân sách dự án',23,'Bold');text(300,734,330,'Bạn đã mô phỏng xong.\nDành một chút thời gian nhìn lại nhé.',14,'Regular','muted');button(300,850,'Viết phản tư →','S10','Secondary',218);
box(844,601,548,325,'mint',28);pill(872,629,'ĐÃ HOÀN THÀNH','canvas',170);text(872,684,450,'Cây cầu đầu tiên',23,'Bold');text(872,734,440,'2 lần thử · 1 phản tư\nBạn đã nhận ra vai trò của thanh giằng.',14,'Regular','muted');button(872,850,'Xem lại hành trình →','S11','Secondary',250);

page('S05','Hôm nay bạn muốn khám phá gì?','S05','Student','Trải nghiệm gần gũi với kiến thức lớp 8 và lớp 9.');
box(272,248,560,48,'canvas',12,'border');icon(288,262,'search',20);text(322,262,480,'Tìm kịch bản hoặc chủ đề…',14,'Regular','muted');button(856,248,'Lớp 8','S05','Secondary',130);button(1006,248,'Lớp 9','S05','Ghost',130);button(1156,248,'Chủ đề ▾','S05','Secondary',235);
scenario(272,326,696,360,'Thiết kế cầu chịu tải','STEM · 3 THỬ THÁCH','mint','bridge','S06','Đang thực hiện');
scenario(992,326,400,360,'Ngân sách\ndự án học đường','ĐỜI SỐNG · LỚP 8–9','cream','finance','S06');
scenario(272,710,696,300,'Khi thành phố ngập nước','KHOA HỌC · LỚP 9','sky','city','S06');
box(992,710,400,300,'mint',28);text(1020,742,340,'Đề xuất cho bạn',22,'SemiBold');text(1020,797,330,'Thử điều kiện mới',20,'SemiBold');text(1020,842,330,'Vì bạn đang luyện cách so sánh\nphương án dựa trên kết quả.',13,'Regular','muted');link(1020,949,'Xem lý do và nhiệm vụ ↗','S06',330);

page('S06','Thiết kế cầu chịu tải','S05','Student','Một ý tưởng có thể đứng vững đến đâu? Hãy tự thử để tìm câu trả lời.');
pill(272,250,'LỚP 8 · STEM','mint',155);pill(443,250,'3 THỬ THÁCH','cream',155);pill(614,250,'30–45 PHÚT','sky',145);
const challenges=[['01','Cây cầu đầu tiên','Làm quen vật liệu và quan sát lần thử tải đầu.','Đã hoàn thành','S11'],['02','Tối ưu kết cấu','Đặt lại thanh giằng trong giới hạn ngân sách.','Đang thực hiện','S07'],['03','Một điều kiện mới','Dùng điều đã học để thử một yêu cầu khác.','Chưa bắt đầu','S07']];
challenges.forEach(([n,a,b,status,to],i)=>{const yy=338+i*212;if(i<2)box(295,yy+44,2,166,'sage',0);box(272,yy,46,46,i<2?'forest':'mint',23);text(272,yy+11,46,n,14,'SemiBold',i<2?'canvas':'forest',{align:'CENTER'});box(342,yy-4,570,180,i===1?'cream':'canvas',22,i===1?null:'border');text(370,yy+20,490,a,23,'SemiBold');text(370,yy+68,490,b,13,'Regular','muted');pill(370,yy+112,status,i===1?'canvas':'mint',158);link(750,yy+116,i===1?'Tiếp tục →':'Xem nhiệm vụ ↗',to,150);});
box(944,334,448,650,'sky',28,'border');bridgeArt(970,365,398,255);text(976,654,370,'Bạn sẽ được thực hiện',23,'SemiBold');bullet(976,713,370,'Lắp ghép ý tưởng','Chọn vật liệu và vị trí thanh giằng.');bullet(976,803,370,'Thử tải & quan sát','So sánh kết quả sau mỗi thay đổi.');bullet(976,893,370,'Tự rút ra điều học được','Giải thích quyết định theo cách của bạn.');

page('S07','Sẵn sàng cho lần thử tiếp theo?','S05','Student','Thử thách 02 · Tối ưu kết cấu cây cầu');stepper(272,254,1100,['Hiểu nhiệm vụ','Thiết kế & thử','Quan sát','Nhìn lại'],0);
box(272,329,704,348,'cream',28);text(304,362,620,'Nhiệm vụ của bạn',26,'Bold');text(304,418,615,'Thiết kế một cây cầu chịu được tải mục tiêu,\nvới số vật liệu nằm trong ngân sách.',18,'Regular');line(304,498,640);metric(304,523,'TẢI MỤC TIÊU','100 đơn vị');metric(620,523,'NGÂN SÁCH','100 điểm');
box(272,701,704,277,'canvas',24);text(304,733,620,'Bạn muốn thao tác bằng cách nào?',21,'SemiBold');button(304,789,'Chuột & bàn phím ✓','S08','Secondary',260);button(588,789,'Cử chỉ / bản vẽ','S08','Ghost',270);text(304,865,620,'Không cần camera để hoàn thành trải nghiệm.\nTiến trình tự động lưu sau mỗi thao tác.',13,'Regular','muted');
box(1000,329,392,649,'mint',28);text(1032,363,320,'Một vài điều trước khi thử',22,'SemiBold');bullet(1032,435,310,'Bạn được thử lại','Thay đổi một phần để dễ so sánh.');bullet(1032,547,310,'Quan sát trước khi sửa','Chú ý điều xảy ra sau quyết định.');bullet(1032,659,310,'Coach luôn ở bên','Xin một gợi ý khi bạn cần.','spark');button(1032,876,'Vào không gian thử →','S08','Primary',328);

// WORKSPACE: a practical simulation bench with visual hierarchy.
S={code:'S08',title:'Không gian trải nghiệm',role:'Student',w:1440,h:1080,nodes:[]};scenes.push(S);
box(0,0,1440,1080,'sky',0);box(0,0,1440,80,'canvas',0);icon(28,28,'leaf',26);text(69,24,200,'AI LifeLab',23,'Bold');link(283,29,'← Hành trình kịch bản','S06',260);icon(1066,30,'save',18);text(1097,29,210,'Đã lưu lúc 14:32',12,'Regular','muted');avatar(1357,19);
text(32,111,800,'Tối ưu kết cấu cây cầu',27,'Bold');pill(1130,109,'THỬ THÁCH 02 / 03','cream',277);stepper(32,170,1370,['Hiểu nhiệm vụ','Thiết kế & thử','Quan sát','Nhìn lại'],1);
box(24,238,276,787,'cream',24);text(48,266,230,'Bàn vật liệu',21,'SemiBold');text(48,309,230,'Chọn vật liệu, rồi chọn\nhai điểm trên mô hình.',13,'Regular','muted');
[['Thanh thép','12 điểm / thanh'],['Thanh gỗ','8 điểm / thanh'],['Nút nối','4 điểm / nút']].forEach(([a,b],i)=>{const yy=382+i*90;box(44,yy,236,72,'canvas',14);icon(60,yy+22,i===2?'target':'book',22);text(100,yy+12,164,a,14,'SemiBold');text(100,yy+39,164,b,11,'Regular','muted');});
line(48,679,228);text(48,703,226,'NGÂN SÁCH CÒN LẠI',11,'SemiBold','muted');text(48,734,226,'40 / 100',30,'Bold','forest',{family:'Manrope'});progress(48,793,224,.4);text(48,828,226,'Tải mục tiêu: 100 đơn vị\nThử thay đổi từng chi tiết nhỏ.',12,'Regular','muted');link(48,947,'Xem lại nhiệm vụ ↗','S07',220);
box(320,238,732,787,'canvas',24,'border');box(340,257,692,48,'sky',12);icon(357,271,'undo',20);link(389,269,'Hoàn tác','S08',110);link(519,269,'Đặt lại','S08',100);pill(811,266,'Chuột & bàn phím','mint',200);
box(340,326,692,420,'sky',20);pill(360,345,'MÔ HÌNH 2D','canvas',140);bridgeArt(368,383,635,335);text(366,708,640,'Chọn hai điểm để thêm một thanh giằng.',12,'Regular','muted');
metric(356,779,'SỐ THANH','8 thanh');metric(590,779,'NGÂN SÁCH ĐÃ DÙNG','60 điểm');metric(824,779,'LẦN THỬ','02');line(356,888,660);button(356,929,'Thử tải cây cầu →','S09','Primary',270);link(701,942,'Chuyển sang phản tư','S10',270);
box(1072,238,344,787,'mint',24);icon(1096,265,'spark',25);text(1135,265,245,'AI Coach',20,'SemiBold');pill(1096,312,'GỢI MỞ, KHÔNG LÀM HỘ','canvas',295);text(1096,376,290,'Bạn muốn kiểm tra\nphần nào trước?',22,'SemiBold');text(1096,460,290,'Hãy nhìn vị trí các thanh giằng.\nBạn dự đoán điều gì sẽ xảy ra\nkhi tải trọng tăng?',14,'Regular','muted');
box(1096,595,296,143,'canvas',17);text(1116,614,255,'Gợi ý nhỏ',13,'SemiBold');text(1116,649,255,'Nếu chỉ đổi một chi tiết,\nbạn muốn đổi điều gì?',14,'Regular');button(1096,766,'Xin thêm một gợi ý','S08','Secondary',296);input(1096,856,296,72,'Trao đổi cùng Coach','Mình muốn kiểm tra…','coach');

page('S09','Lần thử này cho bạn biết điều gì?','S04','Student','Thử thách 02 · Lần thử tải 02 · Kết quả mô phỏng minh họa');stepper(272,252,1100,['Hiểu nhiệm vụ','Thiết kế & thử','Quan sát','Nhìn lại'],2);
box(272,324,704,395,'sky',28,'border');pill(300,351,'CẦN ĐIỀU CHỈNH','cream',190);bridgeArt(329,384,585,280,'load');text(300,670,640,'Vùng giữa cầu biến dạng khi tải đạt 80 đơn vị.',14,'Medium');
box(1000,324,392,395,'cream',28);text(1032,356,320,'So với lần trước',22,'SemiBold');metric(1032,415,'TẢI TRỌNG ĐẠT ĐƯỢC','60 → 80','Tăng sau khi bạn thêm thanh giằng');metric(1032,557,'CHI PHÍ VẬT LIỆU','48 → 60','Trong ngân sách 100 điểm');
box(272,743,704,232,'mint',24);icon(300,771,'spark',24);text(338,771,590,'Coach muốn hỏi bạn…',19,'SemiBold');text(300,820,640,'Thay đổi nào có thể đã giúp cây cầu chịu tải tốt hơn?\nBạn sẽ giữ lại hay điều chỉnh điều gì?',16,'Regular');link(300,921,'Xem lại thiết kế ↗','S08',270);
box(1000,743,392,232,'canvas',24);text(1032,773,320,'Chọn bước tiếp theo',20,'SemiBold');button(1032,823,'Thử một phương án khác','S08','Secondary',328);button(1032,894,'Nhìn lại trải nghiệm →','S10','Primary',328);

page('S10','Một chút nhìn lại, một điều nhận ra','S04','Student','Bạn không cần trả lời hoàn hảo. Hãy kể theo cách của mình.');stepper(272,251,1100,['Hiểu nhiệm vụ','Thiết kế & thử','Quan sát','Nhìn lại'],3);
box(272,325,704,650,'cream',28);text(304,355,620,'Điều gì đã thay đổi trong cách bạn làm?',22,'SemiBold');input(304,420,640,130,'01 · Bạn đã thay đổi điều gì và vì sao?','Em thêm thanh giằng ở giữa vì ở lần thử đầu,\nphần giữa cầu bị võng nhiều nhất.','reflection1');input(304,635,640,130,'02 · Nếu thử thêm một lần, bạn sẽ làm gì?','Em muốn đổi vị trí thanh giằng và so sánh\nkết quả khi dùng cùng số vật liệu.','reflection2');button(304,892,'Lưu & hoàn thành →','S11','Primary',270);link(602,905,'Quay lại kết quả','S09',270);
box(1000,325,392,324,'sky',28,'border');text(1032,357,320,'Nhìn lại bằng chứng',21,'SemiBold');bridgeArt(1034,408,325,170);link(1032,592,'Lần thử 01 → Lần thử 02 ↗','S09',320);
box(1000,673,392,302,'mint',28);icon(1032,702,'spark');text(1070,702,270,'AI Coach',19,'SemiBold');text(1032,757,320,'Bạn nhắc đến “độ võng”.\nKết quả nào giúp bạn nhận ra\nthanh giằng có tác dụng?',16,'Regular');text(1032,902,320,'Bản nháp được lưu trên thiết bị này.',11,'Regular','muted');

page('S11','Bạn vừa đi thêm một bước.','S04','Student','Một vòng thử, quan sát và phản tư đã hoàn thành.');
box(272,248,704,364,'mint',28);pill(304,278,'HOÀN THÀNH TRẢI NGHIỆM','canvas',270);text(304,340,430,'Điều mới không chỉ\nnằm ở cây cầu.',30,'Bold');text(304,443,405,'Bạn đã quan sát, thay đổi và giải thích\nlý do đằng sau một quyết định.',16,'Regular','muted');sproutArt(727,347,210,202);button(304,531,'Xem hồ sơ của mình →','S02','Primary',264);
box(1000,248,392,364,'cream',28);text(1032,281,320,'Dấu vết của lần học này',22,'SemiBold');bullet(1032,353,310,'2 phương án được thử','Bạn có cơ sở để so sánh.');bullet(1032,449,310,'1 điều chỉnh có lý do','Gắn với kết quả quan sát.');link(1032,551,'Xem lại phản tư ↗','S10',300);
text(272,659,1000,'Một gợi ý cho bước tiếp theo',25,'SemiBold');scenario(272,716,704,286,'Thử một điều kiện mới','ĐỀ XUẤT CHO BẠN','sky','bridge','S07');
box(1000,716,392,286,'canvas',24);text(1032,749,320,'Vì sao là trải nghiệm này?',20,'SemiBold');text(1032,809,320,'Bạn đang luyện cách so sánh\nphương án và giải thích bằng\ndữ kiện. Một yêu cầu mới sẽ giúp\nbạn thử lại điều đó.',14,'Regular','muted');link(1032,948,'Chọn một mục tiêu ↗','S03',310);

// TEACHER: actionable overviews and the assignment journey.
page('T01','Một góc nhìn rõ hơn về lớp học','T01','Teacher','Theo dõi quá trình trải nghiệm để hỗ trợ đúng lúc.');button(1148,130,'Giao nhiệm vụ mới →','T03','Primary',242);
box(272,248,704,238,'mint',28);pill(304,276,'LỚP 8A · THIẾT KẾ CẦU','canvas',245);text(304,332,420,'Cả lớp đang ở đâu?',25,'Bold');progress(304,392,640,18/32);text(304,422,640,'18 hoàn thành     10 đang thực hiện     4 chưa bắt đầu',13,'Medium');
box(1000,248,392,238,'cream',28);text(1032,279,320,'Cần hỗ trợ hôm nay',22,'SemiBold');text(1032,334,320,'6 học sinh ở bước thử tải\n4 học sinh chờ phản tư',16,'Regular');link(1032,423,'Xem các phiên liên quan ↗','T07',320);
text(272,531,700,'Nhiệm vụ đang diễn ra',23,'SemiBold');link(1222,537,'Xem tất cả ↗','T02',180);
box(272,588,1120,230,'canvas',24);text(304,615,400,'Nhiệm vụ',11,'SemiBold','muted');text(761,615,180,'Tiến độ',11,'SemiBold','muted');text(1010,615,180,'Thời hạn',11,'SemiBold','muted');
[['Thiết kế cầu chịu tải','Lớp 8A · 32 học sinh','18/32','05/11 · 17:00'],['Ngân sách dự án học đường','Lớp 9A · 30 học sinh','12/30','07/11 · 17:00']].forEach(([a,b,p,d],i)=>{const yy=654+i*78;line(304,yy-7,1056);text(304,yy+7,430,a,15,'SemiBold');text(304,yy+34,430,b,11,'Regular','muted');text(761,yy+15,180,p,16,'SemiBold');text(1010,yy+15,180,d,13,'Regular','muted');link(1303,yy+12,'↗','T07',40);});
box(272,842,704,174,'sky',24,'border');text(304,872,630,'Tiến độ không nói hết quá trình.',20,'SemiBold');text(304,917,630,'Mở phiên học để xem học sinh đã thử gì, thay đổi ra sao\nvà giải thích quyết định như thế nào.',13,'Regular','muted');
box(1000,842,392,174,'mint',24);icon(1032,873,'book');text(1071,870,270,'Một hoạt động mới',20,'SemiBold');link(1032,946,'Chọn từ thư viện ↗','T03',320);

page('T02','Lớp học và những nhiệm vụ','T02','Teacher','Chọn lớp để theo dõi hoặc giao một trải nghiệm mới.');button(1158,130,'Giao nhiệm vụ →','T03','Primary',232);
[['8A','32 học sinh','2 nhiệm vụ đang giao'],['8B','31 học sinh','1 nhiệm vụ đang giao'],['9A','30 học sinh','2 nhiệm vụ đang giao']].forEach(([a,b,c],i)=>{const x=272+i*381;box(x,248,357,206,i===0?'mint':i===1?'sky':'cream',24,i===0?'forest':null);avatar(x+24,273,a,'canvas',48);text(x+89,280,235,'Lớp '+a,24,'Bold');text(x+24,349,300,b+' · '+c,12,'Regular','muted');link(x+24,401,'Mở lớp ↗','T07',290);});
text(272,500,1000,'Nhiệm vụ của lớp 8A',25,'SemiBold');pill(1192,498,'Đang giao','mint',190);
box(272,558,1120,339,'canvas',24);text(304,589,530,'Thiết kế cầu chịu tải',22,'SemiBold');pill(1193,584,'Đã giao','mint',160);text(304,638,650,'Thử thách 01–03 · Hạn hoàn thành: 05/11/2026 lúc 17:00',14,'Regular','muted');progress(304,694,1056,18/32);text(304,725,1000,'18 hoàn thành · 10 đang thực hiện · 4 chưa bắt đầu',13,'Medium');button(304,809,'Theo dõi nhiệm vụ →','T07','Primary',260);link(598,822,'Xem hướng dẫn đã giao','T06',330);
link(272,948,'Khám phá hoạt động phù hợp với lớp ↗','T03',600);

page('T03','Chọn một trải nghiệm cho lớp','T03','Teacher','Kịch bản có sẵn, mục tiêu rõ ràng, sẵn sàng để giao.');box(272,248,560,48,'canvas',12,'border');icon(290,263,'search',20);text(324,261,470,'Tìm theo kiến thức hoặc tên kịch bản…',14,'Regular','muted');button(856,248,'Lớp 8','T03','Secondary',130);button(1006,248,'Lớp 9','T03','Ghost',130);button(1156,248,'Chủ đề ▾','T03','Secondary',235);
scenario(272,326,696,360,'Thiết kế cầu chịu tải','LỚP 8 · LỰC & KẾT CẤU','mint','bridge','T04');scenario(992,326,400,360,'Ngân sách\ndự án học đường','LỚP 8–9 · LẬP KẾ HOẠCH','cream','finance','T04');scenario(272,710,696,300,'Khi thành phố ngập nước','LỚP 9 · RA QUYẾT ĐỊNH','sky','city','T04');box(992,710,400,300,'canvas',24);text(1024,744,330,'Tập trung vào việc dạy.',23,'SemiBold');text(1024,803,330,'Chọn kịch bản, điều chỉnh hướng dẫn\nvà giao cho lớp. Quy tắc mô phỏng\nđã được thiết lập trong hoạt động.',14,'Regular','muted');link(1024,946,'Xem nhiệm vụ đang giao ↗','T02',330);

page('T04','Thiết kế cầu chịu tải','T03','Teacher','Kịch bản có sẵn · Lớp 8 · Thời lượng gợi ý 30–45 phút');button(1138,130,'Chọn để giao →','T05','Primary',252);
box(272,248,704,367,'mint',28);bridgeArt(600,296,350,230);text(304,282,390,'Từ ý tưởng đến\nbằng chứng.',30,'Bold');text(304,390,340,'Học sinh thiết kế, thử tải\nvà giải thích điều chỉnh.',15,'Regular','muted');button(304,528,'Xem trước trải nghiệm ↗','S07','Secondary',280);
box(1000,248,392,367,'cream',28);text(1032,281,320,'Yêu cầu cần đạt',22,'SemiBold');bullet(1032,349,310,'Quan sát có mục đích','Nhận ra thay đổi sau thao tác.');bullet(1032,448,310,'Giải thích có dữ kiện','Kết nối lựa chọn và kết quả.');text(1032,555,320,'Kiến thức: lực, kết cấu, nguồn lực.',12,'Regular','muted');
text(272,655,1000,'Hành trình của hoạt động',24,'SemiBold');stepper(272,716,1100,['Cây cầu đầu tiên','Tối ưu kết cấu','Điều kiện mới'],1);
box(272,805,704,195,'sky',24,'border');text(304,836,620,'Giáo viên có thể điều chỉnh',20,'SemiBold');text(304,884,620,'Hướng dẫn, mục tiêu và mô tả tiêu chí đánh giá.\nQuy tắc mô phỏng và giới hạn vật liệu theo kịch bản.',14,'Regular','muted');
box(1000,805,392,195,'mint',24);text(1032,836,320,'Bằng chứng được lưu',20,'SemiBold');text(1032,884,320,'Lựa chọn · Lần thử · Điều chỉnh\nNội dung phản tư của học sinh',14,'Regular','muted');

page('T05','Thiết lập nhiệm vụ cho lớp','T02','Teacher','Thiết kế cầu chịu tải');stepper(272,252,1100,['Chọn kịch bản','Thiết lập','Xem lại','Giao nhiệm vụ'],1);
box(272,324,704,677,'canvas',28);text(304,355,620,'Thông tin giao nhiệm vụ',23,'SemiBold');input(304,413,640,48,'Lớp nhận nhiệm vụ','Lớp 8A · 32 học sinh','class');input(304,527,304,48,'Ngày hoàn thành','05/11/2026','deadline');input(640,527,304,48,'Thời gian','17:00','time');input(304,641,640,100,'Hướng dẫn cho học sinh','Thử ít nhất hai phương án. Giải thích thay đổi\nbằng kết quả quan sát được.','instructions');input(304,819,640,72,'Mục tiêu học tập','So sánh phương án và giải thích bằng dữ kiện.','objective');
box(1000,324,392,677,'cream',28);text(1032,356,320,'Tiêu chí theo dõi',22,'SemiBold');bullet(1032,423,310,'Quan sát','Ghi nhận hậu quả sau lựa chọn.');bullet(1032,526,310,'Giải thích','Kết nối thay đổi với dữ kiện.');bullet(1032,629,310,'Phản tư','Nêu cách làm khác cho lần tới.');text(1032,758,320,'Có thể điều chỉnh mô tả tiêu chí\ntrong phạm vi kịch bản.',12,'Regular','muted');button(1032,852,'Tiếp tục xem lại →','T06','Primary',328);link(1032,934,'Lưu nháp và quay lại','T02',310);

page('T06','Kiểm tra một lần trước khi giao','T02','Teacher','Học sinh sẽ nhận nhiệm vụ khi bạn chọn “Giao cho lớp”.');stepper(272,252,1100,['Chọn kịch bản','Thiết lập','Xem lại','Giao nhiệm vụ'],2);
box(272,324,704,280,'mint',28);pill(304,354,'SẴN SÀNG GIAO','canvas',185);text(304,414,610,'Thiết kế cầu chịu tải',28,'Bold');text(304,471,620,'Lớp 8A · 32 học sinh\nHạn hoàn thành: 05/11/2026 lúc 17:00',16,'Regular','muted');
box(272,628,704,346,'canvas',24);text(304,659,620,'Điều học sinh sẽ thấy',22,'SemiBold');text(304,718,620,'Thử ít nhất hai phương án. Giải thích thay đổi\nbằng kết quả quan sát được.',17,'Regular');line(304,803,640);text(304,831,620,'Mục tiêu: so sánh phương án và giải thích bằng dữ kiện.',14,'Medium');text(304,876,620,'Tiêu chí: Quan sát · Giải thích · Phản tư',14,'Regular','muted');link(304,931,'← Quay lại chỉnh sửa','T05',350);
box(1000,324,392,650,'cream',28);text(1032,357,320,'Một hành trình mới\nsắp bắt đầu.',26,'Bold');sproutArt(1065,456,260,228);text(1032,724,320,'Sau khi giao, bạn có thể theo dõi\ntiến trình và mở bằng chứng\ncủa từng học sinh.',14,'Regular','muted');button(1032,858,'Giao cho lớp 8A →','T07','Primary',328);

page('T07','Theo dõi từng bước của lớp','T02','Teacher','Thiết kế cầu chịu tải · Lớp 8A · Hạn 05/11/2026 lúc 17:00');pill(1160,130,'ĐÃ GIAO CHO LỚP','mint',230);
box(272,248,1120,94,'mint',20);text(300,273,1060,'18 hoàn thành     10 đang thực hiện     4 chưa bắt đầu',18,'SemiBold');text(300,310,1060,'Mở một học sinh để xem thao tác, kết quả và nội dung phản tư.',12,'Regular','muted');
box(272,366,1120,451,'canvas',24);text(304,396,400,'Học sinh',12,'Medium','muted');text(665,396,230,'Bước hiện tại',12,'Medium','muted');text(1001,396,260,'Trạng thái',12,'Medium','muted');
const pupils=[['MA','Minh Anh','Thiết kế & thử','Đang thực hiện','cream'],['HN','Hoàng Nam','Đã phản tư','Hoàn thành','mint'],['GH','Gia Hân','Chưa bắt đầu','Chưa tham gia','sky'],['TL','Thảo Linh','Nhìn lại','Chờ phản tư','cream']];
pupils.forEach(([av,a,b,c,t],i)=>{const y=444+i*84;line(304,y-4,1056);avatar(304,y+13,av,t,40);text(360,y+18,280,a,14,'SemiBold');text(665,y+18,290,b,13,'Regular','muted');pill(1001,y+13,c,t,215);link(1306,y+18,'↗','T08',35);});
box(272,841,704,170,'cream',24);text(304,871,620,'Điểm cần hỗ trợ',21,'SemiBold');text(304,917,620,'6 học sinh dừng ở bước thử tải · 2 báo lỗi camera.\nCó thể hướng dẫn chuyển sang chuột và bàn phím.',13,'Regular','muted');
box(1000,841,392,170,'sky',24,'border');text(1032,871,320,'Hướng dẫn đã giao',21,'SemiBold');link(1032,939,'Xem lại nội dung nhiệm vụ ↗','T06',320);

page('T08','Minh Anh đã thử như thế nào?','T02','Teacher','Lớp 8A · Thiết kế cầu chịu tải · Phiên gần nhất hôm nay');link(1185,140,'← Danh sách lớp','T07',210);
box(272,248,704,454,'canvas',28);text(304,279,620,'Dòng thời gian trải nghiệm',23,'SemiBold');
[['14:20','Bắt đầu nhiệm vụ','Đọc bối cảnh và tài nguyên.'],['14:25','Thử tải lần 01','Tải đạt được: 60 đơn vị.'],['14:29','Điều chỉnh thiết kế','Bổ sung thanh giằng vùng giữa cầu.'],['14:32','Thử tải lần 02','Tải đạt được: 80 đơn vị.']].forEach(([t,a,b],i)=>{const yy=343+i*80;text(304,yy,70,t,12,'Medium','muted');box(397,yy+5,10,10,'forest',5);if(i<3)box(401,yy+19,2,58,'sage',0);text(430,yy-3,490,a,15,'SemiBold');text(430,yy+29,490,b,12,'Regular','muted');});
box(1000,248,392,454,'mint',28);text(1032,280,320,'Nhận xét có bằng chứng',21,'SemiBold');text(1032,340,320,'Học sinh điều chỉnh kết cấu\nsau khi quan sát độ võng.',17,'Medium');text(1032,430,320,'Nguồn: thao tác 14:29\nvà lần thử tải 01 → 02.',13,'Regular','muted');text(1032,530,320,'Nhận xét AI · Cần được đọc cùng\nbối cảnh và nội dung phản tư.',12,'Regular','muted');link(1032,641,'Mở kết quả mô phỏng ↗','S09',320);
box(272,726,704,278,'cream',24);text(304,756,620,'Lời phản tư của Minh Anh',22,'SemiBold');text(304,818,620,'“Em thêm thanh giằng ở giữa vì ở lần thử đầu,\nphần giữa cầu bị võng nhiều nhất.”',18,'Regular');text(304,936,620,'Nội dung học sinh · Gắn với lần thử 02',12,'Regular','muted');
box(1000,726,392,278,'canvas',24);input(1032,755,328,103,'Góp ý của giáo viên','Em hãy thử so sánh khi giữ nguyên\nsố vật liệu nhé.','teacherComment');button(1032,928,'Lưu góp ý','T07','Primary',328);

require('./summer-direction.js')(scenes,C);
fs.writeFileSync(path.join(__dirname,'palette.json'),JSON.stringify(C,null,2));
const destCodes=new Set(scenes.map(s=>s.code));for(const s of scenes)for(const n of s.nodes)if(n.to&&!destCodes.has(n.to))throw new Error('Unknown prototype target '+n.to);
const out=__dirname;fs.writeFileSync(path.join(out,'scenes.json'),JSON.stringify(scenes,null,2));
console.log(JSON.stringify({screens:scenes.length,nodes:scenes.reduce((a,s)=>a+s.nodes.length,0),links:scenes.reduce((a,s)=>a+s.nodes.filter(n=>n.to).length,0)}));
