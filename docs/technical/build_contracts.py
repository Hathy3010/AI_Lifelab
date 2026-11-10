"""Create design contracts, not an application server."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parent
def write(name,value):
    (ROOT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def obj(properties,required=None,description=None):
    out={'type':'object','properties':properties,'required':list(properties) if required is None else required,'additionalProperties':False}
    if description:out['description']=description
    return out
def integer(low=0,high=None,step=None):
    d={'type':'integer','minimum':low}
    if high is not None:d['maximum']=high
    if step is not None:d['multipleOf']=step
    return d
def string(limit=2000):return {'type':'string','minLength':1,'maxLength':limit,'pattern':r'\S'}
def enum(*values):return {'type':'string','enum':list(values)}
def ref(name):return {'$ref':'#/components/schemas/'+name}
UUID={'type':'string','format':'uuid'}
DATE={'type':['string','null'],'format':'date-time'}
VERSIONS=obj({k:{'const':'v1'} for k in ['content','rules','dataset']})
S={}
inputs={
 '8.1':obj({'threshold_cm':{'type':'integer','enum':[50,60,70,80]}}),
 '8.2':obj({'selected_facilities':{'type':'array','items':enum('cistern','tank','pond'),'uniqueItems':True,'minItems':1,'maxItems':3}}),
 '8.3':obj({'allocations_vnd':obj({'food':integer(100000,300000,10000),'transport':integer(50000,300000,10000),'learning':integer(0,300000,10000),'entertainment':integer(0,300000,10000),'savings':integer(0,300000,10000)})}),
 '9.1':obj({'hours':obj({'lights':integer(4,6),'fans':integer(4,6),'computers':integer(1,2)})}),
 '9.2':obj({'monthly_savings_vnd':{'type':'integer','enum':[0,50000,100000,150000]}}),
 '9.3':obj({'skill':enum('presentation','data_analysis','planning'),'activities':{'type':'array','minItems':1,'maxItems':3,'items':obj({'activity_id':enum('read_summary','explain_choice','revise_choice'),'day':enum('MON','TUE','WED','THU','FRI','SAT','SUN'),'planned_product':string(500)})}})
}
result_schemas={
 '8.1':obj({'datasets':{'type':'array','minItems':2,'maxItems':2,'items':obj({'dataset_id':enum('A','B'),'alert_minute':{'type':['integer','null'],'minimum':0},'hazard_minute':{'type':['integer','null'],'minimum':0},'lead_minutes':{'type':['integer','null']},'classification':enum('EARLY','AT_HAZARD','LATE','MISSED','FALSE_ALERT','CLEAR')})}}),
 '8.2':obj({'cost_points':integer(),'remaining_points':integer(),'rain_volume_m3':{'type':'number','minimum':0},'capacity_m3':{'type':'number','minimum':0},'retained_m3':{'type':'number','minimum':0},'unretained_m3':{'type':'number','minimum':0}}),
 '8.3':obj({'phase':enum('BASELINE','AFTER_EVENT'),'available_vnd':integer(),'allocated_vnd':integer(),'unallocated_vnd':integer(),'savings_vnd':integer(),'savings_target_vnd':integer(),'savings_shortfall_vnd':integer()}),
 '9.1':obj({'device_kwh':obj({k:{'type':'number','minimum':0} for k in ['lights','fans','computers']}),'total_kwh':{'type':'number','minimum':0},'cost_vnd':integer(),'baseline_kwh':{'type':'number'},'saved_kwh':{'type':'number'},'saved_vnd':{'type':'integer'}}),
 '9.2':obj({'phase':enum('BASELINE','AFTER_EVENT'),'fixed_cost_vnd':integer(),'monthly_savings_vnd':integer(),'unallocated_vnd':integer(),'remaining_goal_vnd':integer(),'months_to_goal':{'type':['integer','null'],'minimum':0},'projection_status':enum('REACHED','PROJECTED','NO_SAVINGS')}),
 '9.3':obj({'skill':enum('presentation','data_analysis','planning'),'total_minutes':integer(0,120),'remaining_minutes':integer(0,120),'activity_count':integer(1,3),'plan_only':{'const':True}})
}
names={'8.1':'Water','8.2':'Storage','8.3':'Weekly','9.1':'Energy','9.2':'Saving','9.3':'Skill'}
for code,name in names.items():
    S[name+'Input']=inputs[code];S[name+'Result']=result_schemas[code]
    S[name+'Run']=obj({'client_request_id':UUID,'scenario_id':{'const':code},'input':ref(name+'Input'),'source':enum('mouse','keyboard','gesture') if code=='8.2' else enum('mouse','keyboard')},['client_request_id','scenario_id','input'])
    S[name+'Attempt']=obj({'id':UUID,'session_id':UUID,'scenario_id':{'const':code},'attempt_number':integer(1),'versions':VERSIONS,'input':ref(name+'Input'),'result':ref(name+'Result'),'created_at':{'type':'string','format':'date-time'}})
S['RunRequest']={'oneOf':[ref(n+'Run') for n in names.values()]}
S['Attempt']={'oneOf':[ref(n+'Attempt') for n in names.values()]}
S['Error']=obj({'error':obj({'code':string(64),'message':string(),'fields':{'type':'object','additionalProperties':{'type':'string'}},'request_id':UUID})})
S['User']=obj({'id':UUID,'display_name':string(100),'role':enum('STUDENT','TEACHER'),'grade':{'type':['integer','null'],'enum':[8,9,None]},'learning_goal':{'type':['string','null'],'enum':['EV-01','EV-02','EV-03',None]}})
S['LearningGoal']=obj({'learning_goal':{'type':['string','null'],'enum':['EV-01','EV-02','EV-03',None]}})
S['LoginRequest']=obj({'username':string(100),'password':{'type':'string','minLength':1,'maxLength':256}})
S['AuthResponse']=obj({'user':ref('User'),'csrf_token':string(200)})
S['StartSession']=obj({'client_request_id':UUID,'scenario_id':{'type':'string','enum':list(names)},'assignment_id':UUID},['client_request_id','scenario_id'])
S['Draft']=obj({'input':{'type':'object','maxProperties':20,'description':'Partial scenario fields; backend whitelists keys, permits null while editing. No results or ownership fields.'},'reflection_answer':{'type':'string','maxLength':4000}})
S['SaveDraft']=obj({'base_revision':integer(),'draft':ref('Draft')})
S['DraftSaved']=obj({'revision':integer(1),'saved_at':{'type':'string','format':'date-time'},'draft':ref('Draft')})
S['EventRequest']=obj({'event_id':enum('EXTRA_COST_20000','FIXED_COST_UP_50000')})
S['EventResult']=obj({'event_applied':{'const':True},'phase':{'const':'AFTER_EVENT'},'requires_adjustment':{'type':'boolean'},'shortage_vnd':integer(),'preview_status':enum('READY','INCOMPLETE','NEEDS_ADJUSTMENT'),'revision':integer(1)})
S['CompleteRequest']=obj({'client_request_id':UUID,'selected_attempt_id':UUID,'reflection_answer':string(4000)})
S['Session']=obj({'id':UUID,'scenario_id':{'type':'string','enum':list(names)},'assignment_id':{'type':['string','null'],'format':'uuid'},'status':enum('IN_PROGRESS','REFLECTION','COMPLETED'),'versions':VERSIONS,'draft_revision':integer(),'draft':ref('Draft'),'event_applied':{'type':'boolean'},'created_at':{'type':'string','format':'date-time'},'completed_at':DATE})
S['Evidence']=obj({'criterion_id':enum('EV-01','EV-02','EV-03'),'observation':{'type':'string','maxLength':2000},'status':enum('NOT_REVIEWED','INSUFFICIENT','CLARIFY','SUPPORTED','NOT_APPLICABLE'),'attempt_ids':{'type':'array','items':UUID,'maxItems':2,'uniqueItems':True},'reflection_id':UUID,'origin':enum('SYSTEM','AI','TEACHER')})
S['Completed']=obj({'session':ref('Session'),'reflection_id':UUID,'evidence':{'type':'array','items':ref('Evidence'),'minItems':3,'maxItems':3}})
S['CoachRequest']=obj({'attempt_ids':{'type':'array','items':UUID,'uniqueItems':True,'maxItems':2},'hint_level':integer(1,3),'question':{'type':'string','maxLength':1000}},['attempt_ids','hint_level'])
S['CoachResponse']=obj({'origin':enum('AI','FALLBACK'),'question':string(500),'hint':{'type':'string','maxLength':800},'related_attempt_ids':{'type':'array','items':UUID,'uniqueItems':True,'maxItems':2}})
S['Assessment']=obj({'criterion_id':enum('EV-01','EV-02','EV-03'),'status':enum('INSUFFICIENT','CLARIFY','SUPPORTED','NOT_APPLICABLE'),'comment':string(800),'related_attempt_ids':{'type':'array','items':UUID,'uniqueItems':True,'maxItems':2},'reflection_id':UUID})
S['Feedback']=obj({'origin':enum('AI','FALLBACK'),'prompt_version':{'const':'v1'},'assessments':{'type':'array','items':ref('Assessment'),'minItems':3,'maxItems':3},'requires_teacher_review':{'const':True}})
S['TeacherReviewRequest']=obj({'client_request_id':UUID,'comment':string(2000),'assessments':{'type':'array','items':ref('Assessment'),'maxItems':3}},['client_request_id','comment'])
S['TeacherReview']=obj({'id':UUID,'session_id':UUID,'teacher_id':UUID,'comment':string(2000),'created_at':{'type':'string','format':'date-time'}})
S['AssignmentRequest']=obj({'client_request_id':UUID,'class_id':UUID,'scenario_id':{'type':'string','enum':list(names)},'instructions':string(2000),'due_at':{'type':'string','format':'date-time'}})
S['Assignment']=obj({'id':UUID,'class_id':UUID,'scenario_id':{'type':'string','enum':list(names)},'versions':VERSIONS,'instructions':string(2000),'due_at':{'type':'string','format':'date-time'},'recipient_count':integer(1)})
S['Scenario']=obj({'id':{'type':'string','enum':list(names)},'title':string(200),'grade':integer(8,9),'versions':VERSIONS,'model_limits':string(3000),'input_schema':{'type':'object'},'public_data':{'type':'object'},'reflection_question':string(1000)})
S['Class']=obj({'id':UUID,'name':string(100),'grade':integer(8,9),'student_count':integer()})
S['ProgressItem']=obj({'student_id':UUID,'display_name':string(100),'session_id':{'type':['string','null'],'format':'uuid'},'status':enum('NOT_STARTED','IN_PROGRESS','REFLECTION','COMPLETED'),'completed_at':DATE,'late':{'type':'boolean'}})
S['Progress']=obj({'assignment_id':UUID,'recipient_count':integer(),'items':{'type':'array','items':ref('ProgressItem')}})
S['Recommendation']=obj({'scenario_id':{'type':'string','enum':list(names)},'reason':string(500),'reason_code':enum('SELF_SELECTED_SKILL','NEXT_UNFINISHED')})
S['Profile']=obj({'completed_session_count':integer(),'evidence':{'type':'array','items':ref('Evidence')}})

titles={'8.1':'Cảnh báo mực nước','8.2':'Thu và lưu nước mưa','8.3':'Kế hoạch tiền tiêu vặt','9.1':'Điện năng trường học','9.2':'Tiết kiệm theo tháng','9.3':'Kế hoạch luyện kỹ năng'}
prompts={
'8.1':['Bạn đang chú ý đến bộ dữ liệu nào?','Hãy so thời điểm phát cảnh báo với mốc nguy cơ của bài.','Hai số đo liên tiếp đều phải đạt ngưỡng. Bạn muốn kiểm tra ngưỡng nào tiếp?'],
'8.2':['Bạn muốn ưu tiên ngân sách hay lượng nước giữ được?','Hãy so tổng sức chứa với lượng nước mưa.','Lượng chưa giữ bằng lượng mưa trừ phần đã giữ. Điều này chưa nói được độ sâu ngập ngoài đời.'],
'8.3':['Khoản nào bạn muốn giữ sau chi phí phát sinh?','Hãy so tổng phân bổ với nguồn tiền còn lại.','Bạn có thể điều chỉnh khoản linh hoạt hoặc mục tiêu tiết kiệm; hãy giải thích lựa chọn.'],
'9.1':['Nhóm thiết bị nào bạn muốn xem trước?','Hãy so công suất, số lượng và thời gian của các nhóm.','Đổi W sang kW rồi nhân số lượng và giờ dùng; kiểm tra cả giới hạn giờ tối thiểu.'],
'9.2':['Bạn muốn giữ mức tiết kiệm hay tăng phần dự phòng?','Sau sự kiện, chi phí cố định và tiết kiệm có vượt nguồn tiền không?','Thời gian dự kiến phụ thuộc số tiền còn thiếu và tiết kiệm mỗi tháng; mức bằng 0 chưa tạo được thời điểm đạt mục tiêu.'],
'9.3':['Bạn muốn luyện điều gì qua hoạt động này?','Sản phẩm nào giúp bạn tự quan sát việc luyện tập?','Hãy kiểm tra tổng thời gian và mô tả một sản phẩm cụ thể; lập kế hoạch chưa có nghĩa đã thành thạo.']}
questions={'8.1':'Ngưỡng bạn chọn phản ứng khác nhau thế nào ở hai bộ dữ liệu?','8.2':'Bạn giữ được bao nhiêu nước với chi phí đã chọn và chưa thể kết luận điều gì ngoài đời?','8.3':'Sau phát sinh, bạn đổi khoản nào và vì sao?','9.1':'Bạn điều chỉnh nhóm nào và vì sao vẫn theo giới hạn bài?','9.2':'Biến động ảnh hưởng thời gian đạt mục tiêu như thế nào?','9.3':'Vì sao bạn chọn kỹ năng và sản phẩm luyện tập này?'}
data={
'8.1':{'series':{'A':[30,40,55,65,75,85],'B':[30,55,60,40,35,30]},'sample_interval_minutes':1,'hazard_level_cm':80,'consecutive_readings':2,'alert_latched':True},
'8.2':{'rain_mm':50,'catchment_m2':1000,'budget_points':100,'facilities':{'cistern':{'slot':'A','cost_points':30,'dimensions_m':[5,2,1]},'tank':{'slot':'B','cost_points':40,'dimensions_m':[5,2,2]},'pond':{'slot':'C','cost_points':50,'dimensions_m':[5,3,2]}},'all_water_collected':True,'initial_stored_m3':0},
'8.3':{'initial_available_vnd':300000,'event_cost_vnd':20000,'savings_target_vnd':60000,'minimums_vnd':{'food':100000,'transport':50000}},
'9.1':{'devices':{'lights':{'power_w':20,'quantity':10,'baseline_hours':6},'fans':{'power_w':50,'quantity':4,'baseline_hours':6},'computers':{'power_w':100,'quantity':5,'baseline_hours':2}},'price_vnd_per_kwh':2500},
'9.2':{'monthly_income_vnd':400000,'fixed_cost_vnd':250000,'event_fixed_cost_increase_vnd':50000,'goal_vnd':900000,'already_saved_vnd':300000},
'9.3':{'available_minutes':120,'activities':{'read_summary':{'minutes':30,'title':'Đọc tình huống và ghi ba ý'},'explain_choice':{'minutes':30,'title':'Viết giải thích phương án'},'revise_choice':{'minutes':45,'title':'Sửa phương án sau phản hồi'}}}}
limits={'8.1':'Ngưỡng, dữ liệu và nhãn nguy cơ giả lập; không dự báo lũ thực tế.','8.2':'Cân bằng thể tích lý tưởng, không mô phỏng ngập hay dòng chảy thực tế.','8.3':'Kế hoạch giả định, không phải giao dịch hoặc số dư thực tế.','9.1':'Công suất cố định và đơn giá giả lập; không phải hóa đơn điện thực tế.','9.2':'Dự kiến không lãi suất/biến động khác; không bảo đảm đạt mục tiêu thực tế.','9.3':'Hoàn thành kế hoạch không chứng minh thành thạo hay phù hợp nghề.'}
configs=[]
for code,name in names.items():
    focus={'8.1':['EV-01','EV-03'],'8.2':['EV-02'],'8.3':['EV-02','EV-03'],'9.1':['EV-01'],'9.2':['EV-02','EV-03'],'9.3':['EV-02','EV-03']}[code]
    config={'scenario_id':code,'title':titles[code],'grade':int(code[0]),'versions':{'content':'v1','rules':'v1','dataset':'v1'},'input_schema':inputs[code],'result_schema':result_schemas[code],'data':data[code],'fallback_hints':prompts[code],'reflection_question':questions[code],'model_limits':limits[code],'evidence_criteria':['EV-01','EV-02','EV-03'],'recommendation_focus':focus,'completion':{'requires_reflection':True,'minimum_attempts':2 if code=='8.1' else 1,'requires_distinct_thresholds':code=='8.1','requires_before_and_after_event':code in ['8.3','9.2']}}
    configs.append(config)
write('scenarios.v1.json',{'schema_version':'1.0','scenarios':configs})
write('data-contracts.schema.json',{'$schema':'https://json-schema.org/draft/2020-12/schema','title':'AI LifeLab API and AI contracts','components':{'schemas':S}})

responses={str(c):{'description':d,'content':{'application/json':{'schema':ref('Error')}}} for c,d in [(401,'Chưa đăng nhập'),(403,'Không có quyền hoặc CSRF không hợp lệ'),(404,'Không tìm thấy hoặc không được phép biết tài nguyên'),(409,'Xung đột phiên, revision hoặc mã yêu cầu'),(422,'Đầu vào/điều kiện bài không hợp lệ'),(503,'Không lưu được; không báo thành công')]}
paths={}
def endpoint(path,method,summary,response,request=None,role='STUDENT',status='200',description=''):
    operation={'summary':summary,'operationId':method+'_'+re_id(path),'tags':[role],'description':description,'responses':{status:{'description':'Thành công','content':{'application/json':{'schema':response}}},**responses}}
    params=[]
    import re
    for key in re.findall(r'\{([^}]+)\}',path):params.append({'in':'path','name':key,'required':True,'schema':UUID if key!='scenario_id' else {'type':'string','enum':list(names)}})
    if method in ['post','patch'] and path!='/auth/login':params.append({'in':'header','name':'X-CSRF-Token','required':True,'schema':string(200)})
    if params:operation['parameters']=params
    if request:operation['requestBody']={'required':True,'content':{'application/json':{'schema':request}}}
    if path=='/auth/login':operation['security']=[]
    paths.setdefault(path,{})[method]=operation
def re_id(path):return path.strip('/').replace('/','_').replace('{','').replace('}','')
arr=lambda r:{'type':'array','items':r}
endpoint('/auth/login','post','Đăng nhập',ref('AuthResponse'),ref('LoginRequest'),'ALL',description='Cookie HttpOnly trả bằng Set-Cookie; Origin phải đúng. Password hash dùng thư viện Argon2id, không lưu mật khẩu thô.')
endpoint('/auth/logout','post','Đăng xuất',obj({'logged_out':{'const':True}}),role='ALL',description='Tăng auth_epoch để thu hồi mọi cookie của tài khoản, sau đó xóa cookie.')
endpoint('/me','get','Người dùng và CSRF token',ref('AuthResponse'),role='ALL')
endpoint('/me/goal','patch','Mục tiêu học tập do học sinh tự chọn',ref('LearningGoal'),ref('LearningGoal'),description='Chủ tài khoản STUDENT chọn/xóa một tiêu chí muốn luyện. Không tự gán từ điểm hay AI.')
endpoint('/scenarios','get','Thư viện theo khối lớp',arr(ref('Scenario')),role='ALL')
endpoint('/scenarios/{scenario_id}','get','Chi tiết bài',ref('Scenario'),role='ALL')
endpoint('/classes','get','Lớp giáo viên quản lý',arr(ref('Class')),role='TEACHER')
endpoint('/assignments','post','Giao nhiệm vụ và chụp danh sách lớp',ref('Assignment'),ref('AssignmentRequest'),'TEACHER','201')
endpoint('/me/assignments','get','Nhiệm vụ của học sinh',arr(ref('Assignment')))
endpoint('/assignments/{assignment_id}/progress','get','Tiến độ theo danh sách đã giao',ref('Progress'),role='TEACHER')
endpoint('/sessions','post','Bắt đầu hoặc lấy phiên được giao hiện có',ref('Session'),ref('StartSession'),status='201',description='Trả 200 khi dùng lại phiên đã có. Mỗi học sinh chỉ một phiên cho một nhiệm vụ được giao; tự học tạo phiên mới với request ID mới.')
paths['/sessions']['post']['responses']['200']=paths['/sessions']['post']['responses']['201']
endpoint('/sessions/{session_id}','get','Tiếp tục phiên',ref('Session'),role='OWNER_OR_ASSIGNED_TEACHER')
endpoint('/sessions/{session_id}/attempts','get','Lịch sử lượt thử',arr(ref('Attempt')),role='OWNER_OR_ASSIGNED_TEACHER')
endpoint('/sessions/{session_id}/draft','patch','Lưu nháp có revision',ref('DraftSaved'),ref('SaveDraft'))
endpoint('/sessions/{session_id}/attempts','post','Chạy và lưu kết quả',ref('Attempt'),ref('RunRequest'),status='201',description='Dedupe trước khi xét trạng thái: cùng request ID và hash trả 200 lượt cũ; khác hash trả 409. Khóa hàng session, kiểm tra quyền/phiên bản/phase, tính từ input tường minh. Không lấy input ngầm từ draft.')
paths['/sessions/{session_id}/attempts']['post']['responses']['200']=paths['/sessions/{session_id}/attempts']['post']['responses']['201']
endpoint('/sessions/{session_id}/event','post','Áp dụng sự kiện cố định một lần',ref('EventResult'),ref('EventRequest'),description='Chỉ 8.3/9.2; phải có lượt BASELINE hợp lệ. Đánh dấu event_applied, tăng draft_revision. Nhận lại cùng event trả kết quả hiện tại, không trừ hai lần. Preview shortage dùng bản draft mới nhất, không tạo attempt.')
endpoint('/sessions/{session_id}/coach','post','Gợi ý không ảnh hưởng mô phỏng',ref('CoachResponse'),ref('CoachRequest'),description='Chỉ chủ phiên chưa hoàn thành. Timeout 10s hoặc output không hợp lệ: 200 origin=FALLBACK. Kiểm tra mọi ID được yêu cầu thuộc phiên; không gửi tên/video sang LLM.')
endpoint('/sessions/{session_id}/complete','post','Chốt phản tư và hoàn thành nguyên tử',ref('Completed'),ref('CompleteRequest'),description='Chỉ từ lượt hợp lệ đáp ứng điều kiện. Lưu phản tư, 3 quan sát chưa nhận xét và COMPLETED trong một giao dịch. Cùng completion request/hash trả bản cũ; khác sau hoàn thành trả 409.')
endpoint('/sessions/{session_id}/reflection-feedback','post','Đề xuất nhận xét sau hoàn thành',ref('Feedback'),description='Chỉ chủ phiên COMPLETED. Cache theo nội dung/prompt v1. Không cần dịch vụ job riêng. Khi AI lỗi trả fallback INSUFFICIENT, không ảnh hưởng hoàn thành.')
endpoint('/sessions/{session_id}/evidence','get','Nguồn bằng chứng của phiên',arr(ref('Evidence')),role='OWNER_OR_ASSIGNED_TEACHER')
endpoint('/sessions/{session_id}/reviews','post','Giáo viên góp ý riêng',ref('TeacherReview'),ref('TeacherReviewRequest'),'TEACHER','201',description='Chỉ giáo viên gốc của assignment và phiên COMPLETED; tự học không được truy cập.')
endpoint('/me/profile','get','Hồ sơ không chấm điểm tính cách',ref('Profile'))
endpoint('/me/recommendations','get','Gợi ý theo quy tắc',arr(ref('Recommendation')))
openapi={'openapi':'3.1.0','info':{'title':'AI LifeLab MVP','version':'1.0.0','description':'Design contract only. Not a running server.'},'servers':[{'url':'/api/v1'}],'security':[{'sessionCookie':[]}],'paths':paths,'components':{'securitySchemes':{'sessionCookie':{'type':'apiKey','in':'cookie','name':'lifelab_session'}},'schemas':S}}
write('openapi.json',openapi)
write('ai-contracts.v1.json',{'components':{'schemas':{'Assessment':S['Assessment']}},'coach_response_schema':S['CoachResponse'],'reflection_feedback_schema':S['Feedback'],'assessment_schema':S['Assessment'],'criteria':['EV-01','EV-02','EV-03'],'deadline_seconds':10,'prompt_version':'v1','fallback_by_scenario':prompts,'semantic_checks':['Every referenced ID exists in this session','Only three distinct allowed criteria','Reflection ID matches final reflection','SUPPORTED must cite a source; EV-03 needs two distinct input snapshots plus relevant explanation','Output is a proposal, not a validated competence score']})
print(json.dumps({'scenarios':len(configs),'schemas':len(S),'operations':sum(len(v) for v in paths.values())}))
