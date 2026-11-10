import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
let PGlite;
try{({PGlite}=createRequire(import.meta.url)('@electric-sql/pglite'));}
catch{({PGlite}=createRequire(new URL('../../../lifelab/package.json',import.meta.url))('@electric-sql/pglite'));}
const db=await PGlite.create(),checks=[],hash='a'.repeat(64);
let serial=0;const id=()=>`00000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
function check(name,ok){if(!ok)throw Error(name);checks.push({name,passed:true});}
async function rejected(name,sql,args,code){try{await db.query(sql,args);}catch(e){check(name,e.code===code);return;}throw Error(name+' was accepted');}
await db.exec(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
await db.exec('SET search_path TO lifelab,public');
check('thirteen_tables',(await db.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='lifelab'")).rows[0].n===13);
async function user(role,code){const u=id();await db.query("INSERT INTO users(id,username,password_hash,display_name,role,school_code,student_code,grade) VALUES($1,$2,'TEST_ONLY','Name',$3,'VK',$4,$5)",[u,'user'+u.slice(-4),role,code,role==='STUDENT'?8:null]);return u;}
const u1=await user('STUDENT','HS001'),u2=await user('STUDENT','HS002'),t1=await user('TEACHER',null),t2=await user('TEACHER',null);
await rejected('one_student_account',"INSERT INTO users(id,username,password_hash,display_name,role,school_code,student_code,grade) VALUES($1,'duplicate','TEST_ONLY','An','STUDENT','VK','HS001',8)",[id()],'23505');
await rejected('student_identity_required',"INSERT INTO users(id,username,password_hash,display_name,role,grade) VALUES($1,'missing','TEST_ONLY','An','STUDENT',8)",[id()],'23514');
const c1=id(),c2=id();
await db.query("INSERT INTO classes(id,teacher_id,name,grade) VALUES($1,$2,'8A',8),($3,$4,'8B',8)",[c1,t1,c2,t2]);
await db.query('INSERT INTO enrollments(class_id,student_id) VALUES($1,$2),($3,$4)',[c1,u1,c2,u2]);
const config={scenario_id:'8.2',objects:{A:1,B:2},g:9.8,slot_unit_m:.1};
async function assignment(c,t){const a=id();await db.query("INSERT INTO assignments(id,class_id,teacher_id,client_request_id,request_hash,scenario_id,content_version,rules_version,dataset_version,config_hash,config_snapshot,instructions,due_at) VALUES($1,$2,$3,$4,$5,'8.2','balance-v2','balance-rules-v1','balance-data-v1',$5,$6,'Task',now()+interval '1 day')",[a,c,t,id(),hash,config]);return a;}
await rejected('assignment_teacher_matches_class',"INSERT INTO assignments(id,class_id,teacher_id,client_request_id,request_hash,scenario_id,content_version,rules_version,dataset_version,config_hash,config_snapshot,instructions,due_at) VALUES($1,$2,$3,$4,$5,'8.2','balance-v2','balance-rules-v1','balance-data-v1',$5,$6,'Task',now())",[id(),c1,t2,id(),hash,config],'23503');
const as1=await assignment(c1,t1),as2=await assignment(c2,t2);
await db.query('INSERT INTO assignment_recipients(assignment_id,class_id,student_id) VALUES($1,$2,$3),($4,$5,$6)',[as1,c1,u1,as2,c2,u2]);
await rejected('recipient_must_be_class_member','INSERT INTO assignment_recipients(assignment_id,class_id,student_id) VALUES($1,$2,$3)',[as1,c1,u2],'23503');
await rejected('recipient_class_matches_assignment','INSERT INTO assignment_recipients(assignment_id,class_id,student_id) VALUES($1,$2,$3)',[as1,c2,u2],'23503');
async function session(u,a=null){const s=id();await db.query("INSERT INTO sessions(id,student_id,assignment_id,client_request_id,start_request_hash,scenario_id,content_version,rules_version,dataset_version,config_hash,config_snapshot) VALUES($1,$2,$3,$4,$5,'8.2','balance-v2','balance-rules-v1','balance-data-v1',$5,$6)",[s,u,a,id(),hash,config]);return s;}
await rejected('session_must_be_assignment_recipient',"INSERT INTO sessions(id,student_id,assignment_id,client_request_id,start_request_hash,scenario_id,content_version,rules_version,dataset_version,config_hash,config_snapshot) VALUES($1,$2,$3,$4,$5,'8.2','balance-v2','balance-rules-v1','balance-data-v1',$5,$6)",[id(),u2,as1,id(),hash,config],'23503');
const s1=await session(u1,as1),s2=await session(u2,as2);
let blocked=false;try{await session(u1,as1);}catch(e){blocked=e.code==='23505';}check('one_session_per_assigned_student',blocked);
const self=await session(u1);
blocked=false;try{await session(u1);}catch(e){blocked=e.code==='23505';}check('one_active_self_study_per_scenario',blocked);
check('self_study_without_assignment',(await db.query('SELECT assignment_id FROM sessions WHERE id=$1',[self])).rows[0].assignment_id===null);
async function prediction(s,slot=-4){const p=id();await db.query("INSERT INTO predictions(id,session_id,client_request_id,request_hash,draft_revision,placements_json,plan_hash,predicted_outcome,explanation) VALUES($1,$2,$3,$4,0,$5,$4,'BALANCED','Reason')",[p,s,id(),hash,[{object_id:'A',slot},{object_id:'B',slot:2}]]);return p;}
const p1=await prediction(s1),p2=await prediction(s2),p3=await prediction(s1,-2);
async function attempt(s,p,n){const a=id();await db.query("INSERT INTO attempts(id,session_id,prediction_id,client_request_id,request_hash,attempt_number,source,cv_version,phase,input_json,result_json) VALUES($1,$2,$3,$4,$5,$6,'gesture','hands-v1','BASELINE',$7,$8)",[a,s,p,id(),hash,n,{placements:[{object_id:'A',slot:-4},{object_id:'B',slot:2}]},{left_torque_nm:3.92,right_torque_nm:3.92,outcome:'BALANCED'}]);return a;}
const a1=await attempt(s1,p1,1),a2=await attempt(s2,p2,1);
await rejected('prediction_same_session',"INSERT INTO attempts(id,session_id,prediction_id,client_request_id,request_hash,attempt_number,source,phase,input_json,result_json) VALUES($1,$2,$3,$4,$5,2,'pointer','BASELINE','{}','{}')",[id(),s2,p3,id(),hash],'23503');
await rejected('prediction_single_use',"INSERT INTO attempts(id,session_id,prediction_id,client_request_id,request_hash,attempt_number,source,phase,input_json,result_json) VALUES($1,$2,$3,$4,$5,2,'pointer','BASELINE','{}','{}')",[id(),s1,p1,id(),hash],'23505');
await rejected('gesture_requires_version',"INSERT INTO attempts(id,session_id,client_request_id,request_hash,attempt_number,source,phase,input_json,result_json) VALUES($1,$2,$3,$4,2,'gesture','BASELINE','{}','{}')",[id(),s1,id(),hash],'23514');
const a3=await attempt(s1,p3,2);
await rejected('attempt_immutable',"UPDATE attempts SET source='pointer' WHERE id=$1",[a1],'23514');
await rejected('prediction_immutable',"UPDATE predictions SET explanation='Changed' WHERE id=$1",[p1],'23514');
await rejected('event_only_supported_scenarios',"UPDATE sessions SET event_applied=true,event_applied_at=now() WHERE id=$1",[s1],'23514');
const turn=id();
await db.query("INSERT INTO coach_turns(id,session_id,client_request_id,request_hash,mode,hint_level,question,context_snapshot,context_hash,prompt_version,lease_until) VALUES($1,$2,$3,$4,'COMPARE',1,'Why?',$5,$4,'coach-v1',now()+interval '15 seconds')",[turn,s1,id(),hash,{focused_object_id:'A',draft_revision:0}]);
await db.query('INSERT INTO coach_turn_sources VALUES($1,$2,$3,1)',[turn,a1,s1]);
await rejected('coach_sources_same_session','INSERT INTO coach_turn_sources VALUES($1,$2,$3,2)',[turn,a2,s1],'23503');
await rejected('coach_max_four_sources','INSERT INTO coach_turn_sources VALUES($1,$2,$3,5)',[turn,a3,s1],'23514');
await db.query('INSERT INTO coach_turn_sources VALUES($1,$2,$3,2)',[turn,a3,s1]);
await rejected('coach_context_immutable',"UPDATE coach_turns SET question='Changed' WHERE id=$1",[turn],'23514');
await rejected('ready_requires_response',"UPDATE coach_turns SET status='READY',lease_until=NULL,finished_at=now() WHERE id=$1",[turn],'23514');
await rejected('highlight_requires_object',"UPDATE coach_turns SET status='READY',lease_until=NULL,finished_at=now(),answer='Hint',followup_question='Why?',ui_action='HIGHLIGHT_OBJECT',fallback=true,fallback_reason='timeout' WHERE id=$1",[turn],'23514');
await db.query("UPDATE coach_turns SET status='READY',lease_until=NULL,finished_at=now(),answer='Hint',followup_question='Why?',ui_action='NONE',fallback=true,fallback_reason='timeout' WHERE id=$1",[turn]);
check('fallback_retained',(await db.query('SELECT fallback FROM coach_turns WHERE id=$1',[turn])).rows[0].fallback);
await rejected('finished_coach_immutable',"UPDATE coach_turns SET answer='Changed' WHERE id=$1",[turn],'23514');
await rejected('finished_coach_sources_locked','INSERT INTO coach_turn_sources VALUES($1,$2,$3,3)',[turn,a1,s1],'23514');
await rejected('reflection_same_session',"INSERT INTO reflections(id,session_id,selected_attempt_id,answer) VALUES($1,$2,$3,'My explanation')",[id(),s1,a2],'23503');
const r=id();await db.query("INSERT INTO reflections(id,session_id,selected_attempt_id,answer) VALUES($1,$2,$3,'My explanation')",[r,s1,a1]);
await rejected('one_final_reflection',"INSERT INTO reflections(id,session_id,selected_attempt_id,answer) VALUES($1,$2,$3,'Another explanation')",[id(),s1,a3],'23505');
await rejected('evidence_same_session',"INSERT INTO evidence(id,session_id,criterion_id,attempt_id,reflection_id,observation_json) VALUES($1,$2,'EV-01',$3,$4,'{}')",[id(),s1,a2,r],'23503');
await db.query("INSERT INTO evidence(id,session_id,criterion_id,attempt_id,comparison_attempt_id,reflection_id,observation_json) VALUES($1,$2,'EV-03',$3,$4,$5,'{}')",[id(),s1,a1,a3,r]);
check('evidence_with_two_attempts',true);
await rejected('completed_requires_metadata',"UPDATE sessions SET status='COMPLETED' WHERE id=$1",[s1],'23514');
const queries=await readFile(new URL('./queries.sql',import.meta.url),'utf8');
const queryArgs={student_assignments:[u1],student_attempts:[s1,u1],student_coach_history:[s1,u1],teacher_assignment_progress:[as1,t1]};
for(const part of queries.split('-- QUERY ').slice(1)){
 const [name,...lines]=part.split('\n');
 const result=await db.query(lines.join('\n'),queryArgs[name.trim()]);
 check('query_'+name.trim(),result.rows.length>0);
 if(name.trim()==='teacher_assignment_progress')check('teacher_query_is_scoped',(await db.query(lines.join('\n'),[as1,t2])).rows.length===0);
}
const version=(await db.query('SELECT version() AS value')).rows[0].value;
await db.close();
const report={scope:'FULL PROJECT: 13 tables',engine:'PGlite (isolated in-memory PostgreSQL WASM)',version,passed:checks.length,checks,not_tested:['native PostgreSQL server','backend authorization and scenario rules','multi-connection concurrency','LLM calls','camera recognition']};
await writeFile(new URL('./database-validation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(`Passed ${checks.length} full-project database checks`);
