// Pinch-to-place controller. Thresholds are PoC assumptions, not measured accuracy.
export const FACILITIES={cistern:{slot:'A',cost:30},tank:{slot:'B',cost:40},pond:{slot:'C',cost:50}};
export const SOURCE_RECTS=[{id:'cistern',x:.03,y:.08,w:.28,h:.22},{id:'tank',x:.36,y:.08,w:.28,h:.22},{id:'pond',x:.69,y:.08,w:.28,h:.22}];
export const SLOT_RECTS=[{id:'A',x:.03,y:.65,w:.28,h:.24},{id:'B',x:.36,y:.65,w:.28,h:.24},{id:'C',x:.69,y:.65,w:.28,h:.24}];
const hit=(rects,x,y)=>rects.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
export class GestureController{
 constructor(){this.state='IDLE';this.holding=null;this.closedFrames=0;this.openFrames=0;this.lastPresentAt=null;this.lastEmitAt=-Infinity;}
 cancel(){this.state='IDLE';this.holding=null;this.closedFrames=this.openFrames=0;this.lastPresentAt=null;}
 feed({present,ratio,x,y,at}){
  if(!present){this.closedFrames=this.openFrames=0;if(this.lastPresentAt!==null&&at-this.lastPresentAt>=300)this.cancel();return null;}
  this.lastPresentAt=at;
  if(!Number.isFinite(ratio)||!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1){this.cancel();return null;}
  this.closedFrames=ratio<.25?this.closedFrames+1:0;
  this.openFrames=ratio>.45?this.openFrames+1:0;
  if(this.state==='IDLE'&&this.closedFrames>=3&&at-this.lastEmitAt>=400){const source=hit(SOURCE_RECTS,x,y);if(source){this.holding=source.id;this.state='DRAGGING';this.openFrames=0;}}
  if(this.state==='DRAGGING'&&this.openFrames>=3){
   const selected=this.holding;const target=hit(SLOT_RECTS,x,y);this.cancel();
   if(target&&FACILITIES[selected].slot===target.id){this.lastEmitAt=at;return {action:'PLACE_FACILITY',facility_id:selected,slot_id:target.id,source:'gesture'};}
  }
  return null;
 }
}
export function applyPlacement(selected,event){
 const facility=FACILITIES[event.facility_id];
 if(!facility||facility.slot!==event.slot_id)throw Error('INVALID_SLOT');
 const next=[...new Set([...selected,event.facility_id])];
 if(next.reduce((s,k)=>s+FACILITIES[k].cost,0)>100)throw Error('BUDGET_EXCEEDED');
 return next;
}
