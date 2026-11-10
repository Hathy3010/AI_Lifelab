import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GestureController,applyPlacement} from './cv-controller.mjs';
const cases=[];
function run(name,fn){fn();cases.push({name,passed:true});}
function close(c,x=.5,y=.15,t=0){let e;for(let i=0;i<3;i++)e=c.feed({present:true,ratio:.1,x,y,at:t+i*50});return e;}
function open(c,x=.5,y=.75,t=200){let e;for(let i=0;i<3;i++)e=c.feed({present:true,ratio:.6,x,y,at:t+i*50});return e;}
run('valid_drop_once',()=>{const c=new GestureController();close(c);assert.equal(c.state,'DRAGGING');const e=open(c);assert.deepEqual(e,{action:'PLACE_FACILITY',facility_id:'tank',slot_id:'B',source:'gesture'});assert.equal(open(c,.5,.75,500),null);});
run('wrong_slot_cancel',()=>{const c=new GestureController();close(c);assert.equal(open(c,.1,.75),null);assert.equal(c.state,'IDLE');});
run('hand_loss_cancel',()=>{const c=new GestureController();close(c);c.feed({present:false,at:401});assert.equal(c.state,'IDLE');assert.equal(open(c),null);});
run('noise_not_select',()=>{const c=new GestureController();for(let i=0;i<10;i++)c.feed({present:true,ratio:i%2?.5:.1,x:.5,y:.15,at:i*50});assert.equal(c.state,'IDLE');});
run('outside_palette_no_selection',()=>{const c=new GestureController();close(c,.5,.5);assert.equal(c.state,'IDLE');});
run('hysteresis_keeps_drag',()=>{const c=new GestureController();close(c);c.feed({present:true,ratio:.35,x:.5,y:.5,at:150});assert.equal(c.state,'DRAGGING');});
run('invalid_coordinate_cancel',()=>{const c=new GestureController();close(c);c.feed({present:true,ratio:.1,x:NaN,y:.5,at:150});assert.equal(c.state,'IDLE');});
run('mouse_and_gesture_same_result',()=>{const event={facility_id:'tank',slot_id:'B'};assert.deepEqual(applyPlacement([],event),applyPlacement([],{...event,source:'gesture'}));});
run('placement_deduplicated',()=>{assert.deepEqual(applyPlacement(['tank'],{facility_id:'tank',slot_id:'B'}),['tank']);});
run('budget_rejected',()=>{assert.throws(()=>applyPlacement(['tank','pond'],{facility_id:'cistern',slot_id:'A'}),/BUDGET_EXCEEDED/);});
const report={scope:'Synthetic landmark-state replay and placement rules only; not real camera recognition',passed:cases.length,cases};
fs.writeFileSync(new URL('./cv-replay-report.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({cv_replay_checks:cases.length}));
