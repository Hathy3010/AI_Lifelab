async function run(){
 const state=await foundations();
 const page=await figma.getNodeByIdAsync(state.pageId);
 const created=[],mutated=[],links=[];
 const vars={};for(const [key,id]of Object.entries(state.variables))vars[key]=await figma.variables.getVariableByIdAsync(id);
 const allFonts=[{family:'Be Vietnam Pro',style:'Regular'},{family:'Be Vietnam Pro',style:'Medium'},{family:'Be Vietnam Pro',style:'SemiBold'},{family:'Be Vietnam Pro',style:'Bold'},{family:'Manrope',style:'Bold'}];
 await Promise.all(allFonts.map(f=>figma.loadFontAsync(f)));
 let responsiveIndex=0;
 for(const scene of SCENES){if(!state.frames[scene.code]){let f=page.children.find(n=>n.name.startsWith(scene.code+' · '));if(!f){f=figma.createFrame();page.appendChild(f);created.push(f.id);}f.name=scene.code+' · '+scene.title;f.resize(scene.w,scene.h);f.x=18000+(responsiveIndex%4)*950;f.y=200+Math.floor(responsiveIndex/4)*2000;state.frames[scene.code]=f.id;responsiveIndex++;}}
 const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
 function paint(name){const p={type:'SOLID',color:rgb(PALETTE[name]||name)};return [vars[name]?figma.variables.setBoundVariableForPaint(p,'color',vars[name]):p];}
 const mains={};for(const kind of ['Primary','Secondary','Ghost'])mains[kind]=await figma.getNodeByIdAsync(state.buttons['Kind='+kind+', State=Default']);
 function keep(n){created.push(n.id);return n;}
 async function putText(f,n){const t=keep(figma.createText());t.name=n.value.slice(0,64);t.fontName={family:n.family||'Be Vietnam Pro',style:n.style||'Regular'};t.fontSize=n.size||14;t.lineHeight={unit:'PERCENT',value:150};t.characters=n.value;t.fills=paint(n.fill||'ink');t.textAutoResize='HEIGHT';t.resize(n.w,Math.max(n.h||24,24));if(n.align)t.textAlignHorizontal=n.align;if(n.letterSpacing)t.letterSpacing={unit:'PIXELS',value:n.letterSpacing};f.appendChild(t);t.x=n.x;t.y=n.y;return t;}
 for(const scene of SCENES){
  const f=await figma.getNodeByIdAsync(state.frames[scene.code]);
  // Re-running updates only the explicitly named UI page, retaining the original wireframes.
  const oldFonts=new Map();for(const t of f.findAllWithCriteria({types:['TEXT']}))for(const seg of t.getStyledTextSegments(['fontName']))oldFonts.set(JSON.stringify(seg.fontName),seg.fontName);
  await Promise.all([...oldFonts.values()].map(font=>figma.loadFontAsync(font)));
  for(const ch of [...f.children])ch.remove();
  f.fills=paint('canvas');f.resize(scene.w,scene.h);f.name=scene.code+' · '+scene.title;mutated.push(f.id);
  for(const n of scene.nodes){
   if(n.type==='box'){
    const b=keep(figma.createFrame());b.name='Surface / '+n.fill;f.appendChild(b);b.resize(n.w,n.h);b.x=n.x;b.y=n.y;b.fills=paint(n.fill);b.cornerRadius=n.radius||0;b.clipsContent=false;
    if(n.radius===24&&vars['radius/panel'])for(const edge of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])b.setBoundVariable(edge,vars['radius/panel']);
    if(n.stroke){b.strokes=paint(n.stroke);b.strokeWeight=1;}
   }else if(n.type==='text')await putText(f,n);
   else if(n.type==='svg'){
    const a=keep(figma.createNodeFromSvg(n.source));created.push(...a.findAll(()=>true).map(v=>v.id));f.appendChild(a);a.name=n.name||'Vector illustration';a.resize(n.w,n.h);a.x=n.x;a.y=n.y;
   }else if(n.type==='button'){
    const b=keep(mains[n.kind].createInstance());created.push(...b.findAll(()=>true).map(v=>v.id));f.appendChild(b);b.name='Action / '+n.label;b.setProperties({[state.labelProperty]:n.label});b.resize(n.w,n.h);b.x=n.x;b.y=n.y;links.push({node:b,to:n.to,from:scene.code,label:n.label});
   }else if(n.type==='link'){
    const b=keep(figma.createFrame());f.appendChild(b);b.name='Link / '+n.label;b.resize(n.w,n.h);b.x=n.x;b.y=n.y;b.fills=[];b.layoutMode='HORIZONTAL';b.primaryAxisSizingMode='FIXED';b.counterAxisSizingMode='FIXED';b.clipsContent=false;
    const t=await putText(b,{...n,x:0,y:0,value:n.label,size:n.size||14,style:n.selected?'SemiBold':'Regular',fill:'forest'});links.push({node:b,to:n.to,from:scene.code,label:n.label});
   }else if(n.type==='input'){
    const holder=keep(figma.createFrame());f.appendChild(holder);holder.name='Input / '+n.field;holder.resize(n.w,n.h);holder.x=n.x;holder.y=n.y;holder.fills=[];holder.layoutMode='VERTICAL';holder.primaryAxisSizingMode='FIXED';holder.counterAxisSizingMode='FIXED';holder.clipsContent=false;await putText(holder,{...n,x:0,y:0,size:14,value:n.value,fill:'ink'});
   }
  }
 }
 for(const l of links)await l.node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:state.frames[l.to],navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.18,easing:{type:'EASE_OUT'}},resetScrollPosition:true}]}]);
 page.flowStartingPoints=[{nodeId:state.frames.H01,name:'01 · Khám phá AI LifeLab'},{nodeId:state.frames.S01,name:'02 · Hành trình học sinh'},{nodeId:state.frames.T01,name:'03 · Giao và theo dõi nhiệm vụ'}];
 figma.viewport.scrollAndZoomIntoView([await figma.getNodeByIdAsync(state.frames.S01)]);
 figma.closePlugin('Đã tạo 22 UI và '+links.length+' liên kết prototype. Mở page UI · Prototype.');
 return {createdNodeIds:created,mutatedNodeIds:mutated,links:links.map(l=>({id:l.node.id,to:l.to,from:l.from,label:l.label}))};
}
run().catch(err=>{console.error(err);figma.closePlugin('Chưa hoàn tất: '+String(err.message||err));});
