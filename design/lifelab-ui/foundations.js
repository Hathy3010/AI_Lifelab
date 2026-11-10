// AI LifeLab: scoped foundations for the requested screen redesign.
const created=[],mutated=[];
const pages=figma.root.children;
let page=pages.find(p=>p.name==='UI · Prototype');
if(!page){page=figma.createPage();page.name='UI · Prototype';created.push(page.id);}
await figma.setCurrentPageAsync(page);
const fontSpecs=[['Manrope','Regular'],['Manrope','Medium'],['Manrope','SemiBold'],['Manrope','Bold'],['Manrope','Bold']];
await Promise.all(fontSpecs.map(([family,style])=>figma.loadFontAsync({family,style})));
function rgb(h){return {r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255};}
// Adapted from the bundled createVariableCollection helper.
async function createVariableCollection(name,modeNames){const collection=figma.variables.createVariableCollection(name);collection.renameMode(collection.modes[0].modeId,modeNames[0]);return {collection,modeIds:{[modeNames[0]]:collection.modes[0].modeId}};}
let collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='LifeLab / UI');
if(!collection){collection=(await createVariableCollection('LifeLab / UI',['Light'])).collection;created.push(collection.id);}
const mode=collection.modes[0].modeId;
const existing=await figma.variables.getLocalVariablesAsync();
const vars={};
const palette={"sky":"#F4FAFF","cream":"#FFF7E6","mint":"#E8F8F1","forest":"#3B82F6","ink":"#17365E","muted":"#4F6581","border":"#CADDE9","canvas":"#E5F1FF","sage":"#95D5BF","blue":"#3B82F6","ochre":"#825608","red":"#A93954","aqua":"#EAF6F8","green":"#10B981","yellow":"#FFBF24","pink":"#FF8FA3","peach":"#FCE8EE","butter":"#FFF0C2","leaf":"#DDF4E8","onPrimary":"#071B35","hover":"#70A3F8"};
for(const [name,hex]of Object.entries(palette)){
 let primitive=existing.find(v=>v.name==='primitive/'+name&&v.variableCollectionId===collection.id);
 if(!primitive){primitive=figma.variables.createVariable('primitive/'+name,collection,'COLOR');created.push(primitive.id);primitive.scopes=[];primitive.setValueForMode(mode,{...rgb(hex),a:1});primitive.setVariableCodeSyntax('WEB','var(--lifelab-'+name+')');}
 let semantic=existing.find(v=>v.name==='color/'+name&&v.variableCollectionId===collection.id);
 if(!semantic){semantic=figma.variables.createVariable('color/'+name,collection,'COLOR');created.push(semantic.id);semantic.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];semantic.setValueForMode(mode,{type:'VARIABLE_ALIAS',id:primitive.id});semantic.setVariableCodeSyntax('WEB','var(--color-'+name+')');}
 vars[name]=semantic;
}
for(const [name,value,scopes]of [['space/sm',12,['GAP']],['space/md',20,['GAP']],['space/lg',28,['GAP']],['radius/button',12,['CORNER_RADIUS']],['radius/panel',24,['CORNER_RADIUS']]]){
 let v=existing.find(v=>v.name===name&&v.variableCollectionId===collection.id);if(!v){v=figma.variables.createVariable(name,collection,'FLOAT');created.push(v.id);v.scopes=scopes;v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB','var(--'+name.replace('/','-')+')');}vars[name]=v;
}
const styles={};const knownStyles=await figma.getLocalTextStylesAsync();
for(const [name,size,style,family]of [['Display',48,'Bold','Manrope'],['Heading',32,'Bold','Manrope'],['Title',22,'SemiBold','Manrope'],['Body',16,'Regular','Manrope'],['Label',14,'Medium','Manrope'],['Caption',12,'Regular','Manrope'],['Number',36,'Bold','Manrope']]){
 let st=knownStyles.find(s=>s.name==='LifeLab/'+name);if(!st){st=figma.createTextStyle();created.push(st.id);st.name='LifeLab/'+name;st.fontName={family,style};st.fontSize=size;st.lineHeight={unit:'PERCENT',value:150};}styles[name]=st.id;
}
function p(name){return [figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(palette[name])},'color',vars[name])];}
let set=page.children.find(n=>n.type==='COMPONENT_SET'&&n.name==='LifeLab / Button');
if(!set){
 const buttons=[];
 for(const kind of ['Primary','Secondary','Ghost'])for(const state of ['Default','Hover','Disabled']){
  const c=figma.createComponent();created.push(c.id);page.appendChild(c);c.name='Kind='+kind+', State='+state;c.layoutMode='HORIZONTAL';c.resize(220,48);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';c.paddingLeft=c.paddingRight=20;c.itemSpacing=12;
  for(const edge of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])c.setBoundVariable(edge,vars['radius/button']);
  c.fills=kind==='Primary'?p(state==='Hover'?'hover':'forest'):kind==='Secondary'?p(state==='Hover'?'mint':'canvas'):[];
  c.strokes=kind==='Secondary'?p('border'):[];if(state==='Disabled')c.opacity=.38;
  const t=figma.createText();created.push(t.id);t.fontName={family:'Manrope',style:'Medium'};t.characters='Khám phá ngay';t.fontSize=14;t.fills=p(kind==='Primary'?'onPrimary':'ink');t.name='Label';c.appendChild(t);buttons.push(c);
 }
 set=figma.combineAsVariants(buttons,page);created.push(set.id);set.name='LifeLab / Button';set.description='Buttons for AI LifeLab. Primary for one next action; Secondary for alternate route; Ghost for navigation. 48px height. Disabled has no navigation.';
 set.x=16000;set.y=300;
 set.children.forEach((b,i)=>{b.x=24+(i%3)*244;b.y=24+Math.floor(i/3)*80;});set.resize(780,288);
 const prop=set.addComponentProperty('Label','TEXT','Khám phá ngay');
 for(const b of set.children){const label=b.children.find(n=>n.type==='TEXT');label.componentPropertyReferences={characters:prop};}
 for(const b of set.children){if(b.name.includes('State=Default')){const hover=set.children.find(n=>n.name===b.name.replace('Default','Hover'));await b.setReactionsAsync([{trigger:{type:'ON_HOVER'},actions:[{type:'NODE',destinationId:hover.id,navigation:'CHANGE_TO',transition:{type:'DISSOLVE',duration:.12,easing:{type:'EASE_OUT'}}}]}]);}}
}
const specs=[['H01','Trang chủ'],['H02','Khám phá kịch bản'],['H03','Giới thiệu và hướng dẫn'],['S01','Trang cá nhân'],['S02','Hồ sơ năng lực'],['S03','Mục tiêu cá nhân'],['S04','Trải nghiệm của mình'],['S05','Thư viện trải nghiệm'],['S06','Hành trình kịch bản'],['S07','Chuẩn bị trải nghiệm'],['S08','Không gian trải nghiệm'],['S09','Kết quả mô phỏng'],['S10','Nhìn lại trải nghiệm'],['S11','Hoàn thành trải nghiệm'],['T01','Tổng quan giảng dạy'],['T02','Lớp và nhiệm vụ'],['T03','Thư viện hoạt động'],['T04','Chi tiết hoạt động'],['T05','Thiết lập nhiệm vụ'],['T06','Xem lại trước khi giao'],['T07','Theo dõi nhiệm vụ'],['T08','Tiến trình học sinh']];
const frames={};const counters={H:0,S:0,T:0};
for(const [code,title]of specs){let f=page.children.find(n=>n.name.startsWith(code+' · '));if(!f){f=figma.createFrame();page.appendChild(f);created.push(f.id);f.name=code+' · '+title;f.resize(1440,1080);f.fills=p('canvas');f.clipsContent=true;}const g=code[0],i=counters[g]++;f.x=200+({H:0,S:5000,T:10000}[g])+(i%3)*1580;f.y=200+Math.floor(i/3)*1240;frames[code]=f.id;}
page.flowStartingPoints=[{nodeId:frames.H01,name:'01 · Khám phá AI LifeLab'},{nodeId:frames.S01,name:'02 · Hành trình học sinh'},{nodeId:frames.T01,name:'03 · Giao và theo dõi nhiệm vụ'}];mutated.push(page.id);
return {createdNodeIds:created,mutatedNodeIds:mutated,pageId:page.id,frames,variables:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,v.id])),styles,buttons:Object.fromEntries(set.children.map(b=>[b.name,b.id])),labelProperty:Object.keys(set.componentPropertyDefinitions).find(k=>k.startsWith('Label#')),componentSet:set.id};
