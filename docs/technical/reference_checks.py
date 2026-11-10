"""Executable checks for the design; no HTTP server, database or real LLM involved."""
from pathlib import Path
from copy import deepcopy
import json, math
from jsonschema import Draft202012Validator,FormatChecker

ROOT=Path(__file__).resolve().parent
ROOT_CONTRACT=json.loads((ROOT/'data-contracts.schema.json').read_text(encoding='utf-8'))
CONFIGS={s['scenario_id']:s for s in json.loads((ROOT/'scenarios.v1.json').read_text(encoding='utf-8'))['scenarios']}
class InvalidInput(ValueError):pass
def validate(name,value):
    target={'$ref':'#/components/schemas/'+name,**ROOT_CONTRACT}
    Draft202012Validator(target,format_checker=FormatChecker()).validate(value)
def calculate(code,input_data,event_applied=False):
    c=CONFIGS[code];d=c['data'];Draft202012Validator(c['input_schema']).validate(input_data)
    if event_applied and code not in ('8.3','9.2'):raise InvalidInput('event_not_allowed')
    phase='AFTER_EVENT' if event_applied else 'BASELINE'
    if code=='8.1':
        t=input_data['threshold_cm'];items=[]
        for label,series in d['series'].items():
            hazard=next((i for i,v in enumerate(series) if v>=d['hazard_level_cm']),None)
            alert=next((i for i in range(1,len(series)) if series[i-1]>=t and series[i]>=t),None)
            state=('FALSE_ALERT' if alert is not None else 'CLEAR') if hazard is None else ('MISSED' if alert is None else 'EARLY' if alert<hazard else 'AT_HAZARD' if alert==hazard else 'LATE')
            items.append({'dataset_id':label,'alert_minute':alert,'hazard_minute':hazard,'lead_minutes':hazard-alert if alert is not None and hazard is not None else None,'classification':state})
        result={'datasets':items}
    elif code=='8.2':
        selected=[d['facilities'][v] for v in input_data['selected_facilities']]
        cost=sum(v['cost_points'] for v in selected)
        if cost>d['budget_points']:raise InvalidInput('budget_exceeded')
        volume=d['rain_mm']/1000*d['catchment_m2'];capacity=sum(math.prod(v['dimensions_m']) for v in selected)
        result={'cost_points':cost,'remaining_points':d['budget_points']-cost,'rain_volume_m3':volume,'capacity_m3':capacity,'retained_m3':min(volume,capacity),'unretained_m3':max(0,volume-capacity)}
    elif code=='8.3':
        available=d['initial_available_vnd']-(d['event_cost_vnd'] if event_applied else 0);a=input_data['allocations_vnd'];total=sum(a.values())
        if total>available:raise InvalidInput('budget_exceeded')
        result={'phase':phase,'available_vnd':available,'allocated_vnd':total,'unallocated_vnd':available-total,'savings_vnd':a['savings'],'savings_target_vnd':d['savings_target_vnd'],'savings_shortfall_vnd':max(0,d['savings_target_vnd']-a['savings'])}
    elif code=='9.1':
        wh={k:v['power_w']*v['quantity']*input_data['hours'][k] for k,v in d['devices'].items()}
        baseline_wh=sum(v['power_w']*v['quantity']*v['baseline_hours'] for v in d['devices'].values());total_wh=sum(wh.values());price=d['price_vnd_per_kwh']
        result={'device_kwh':{k:v/1000 for k,v in wh.items()},'total_kwh':total_wh/1000,'cost_vnd':round(total_wh*price/1000),'baseline_kwh':baseline_wh/1000,'saved_kwh':(baseline_wh-total_wh)/1000,'saved_vnd':round((baseline_wh-total_wh)*price/1000)}
    elif code=='9.2':
        cost=d['fixed_cost_vnd']+(d['event_fixed_cost_increase_vnd'] if event_applied else 0);saving=input_data['monthly_savings_vnd'];remaining=max(0,d['goal_vnd']-d['already_saved_vnd'])
        if cost+saving>d['monthly_income_vnd']:raise InvalidInput('budget_exceeded')
        months=0 if remaining==0 else math.ceil(remaining/saving) if saving else None
        result={'phase':phase,'fixed_cost_vnd':cost,'monthly_savings_vnd':saving,'unallocated_vnd':d['monthly_income_vnd']-cost-saving,'remaining_goal_vnd':remaining,'months_to_goal':months,'projection_status':'REACHED' if remaining==0 else 'PROJECTED' if saving else 'NO_SAVINGS'}
    else:
        activities=input_data['activities'];ids=[v['activity_id'] for v in activities]
        if len(set(ids))!=len(ids):raise InvalidInput('duplicate_activity')
        if any(not v['planned_product'].strip() for v in activities):raise InvalidInput('blank_product')
        minutes=sum(d['activities'][v]['minutes'] for v in ids)
        if minutes>d['available_minutes']:raise InvalidInput('time_exceeded')
        result={'skill':input_data['skill'],'total_minutes':minutes,'remaining_minutes':d['available_minutes']-minutes,'activity_count':len(ids),'plan_only':True}
    Draft202012Validator(c['result_schema']).validate(result)
    return result

def check_coach(output,allowed_ids):
    validate('CoachResponse',output)
    if not set(output['related_attempt_ids'])<=set(allowed_ids):raise InvalidInput('foreign_attempt')
    return output
def check_feedback(output,allowed_ids,reflection_id,has_distinct_attempts):
    validate('Feedback',output)
    entries=output['assessments']
    if {v['criterion_id'] for v in entries}!={'EV-01','EV-02','EV-03'}:raise InvalidInput('invalid_criteria')
    for v in entries:
        if not set(v['related_attempt_ids'])<=set(allowed_ids) or v['reflection_id']!=reflection_id:raise InvalidInput('foreign_source')
        if v['status']=='SUPPORTED' and not v['related_attempt_ids']:raise InvalidInput('missing_reference')
        if v['criterion_id']=='EV-03' and v['status']=='SUPPORTED' and (len(v['related_attempt_ids'])<2 or not has_distinct_attempts):raise InvalidInput('insufficient_comparison')
    return output

def main():
    checks=[]
    def check(name,fn):
        assert fn(),name;checks.append({'name':name,'passed':True})
    def rejected(fn):
        try:fn()
        except (InvalidInput,ValueError,KeyError):return True
        from jsonschema.exceptions import ValidationError
        # ValidationError is an Exception, not a ValueError on all supported versions.
        return False
    def invalid(fn):
        from jsonschema.exceptions import ValidationError
        try:fn()
        except (InvalidInput,ValidationError):return True
        return False
    for s in ROOT_CONTRACT['components']['schemas'].values():Draft202012Validator.check_schema(s)
    for t,wanted in [(50,(3,2)),(60,(4,None)),(70,(5,None)),(80,(None,None))]:
        r=calculate('8.1',{'threshold_cm':t});check(f'water_{t}',lambda r=r,w=wanted:tuple(v['alert_minute'] for v in r['datasets'])==w)
    check('water_domain',lambda:invalid(lambda:calculate('8.1',{'threshold_cm':65})))
    check('water_no_fake_results',lambda:invalid(lambda:calculate('8.1',{'threshold_cm':60,'alert_minute':0})))
    check('storage_50m3',lambda:calculate('8.2',{'selected_facilities':['tank','pond']})['unretained_m3']==0)
    check('storage_20m3_left',lambda:calculate('8.2',{'selected_facilities':['cistern','tank']})['unretained_m3']==20)
    check('storage_budget',lambda:invalid(lambda:calculate('8.2',{'selected_facilities':['cistern','tank','pond']})))
    check('storage_duplicate',lambda:invalid(lambda:calculate('8.2',{'selected_facilities':['tank','tank']})))
    budget={'allocations_vnd':{'food':100000,'transport':50000,'learning':30000,'entertainment':40000,'savings':60000}}
    check('weekly_before',lambda:calculate('8.3',budget)['unallocated_vnd']==20000)
    check('weekly_after',lambda:calculate('8.3',budget,True)['unallocated_vnd']==0)
    expensive=deepcopy(budget);expensive['allocations_vnd']['learning']=50000
    check('weekly_event_requires_adjustment',lambda:invalid(lambda:calculate('8.3',expensive,True)))
    check('weekly_minimum',lambda:invalid(lambda:calculate('8.3',{'allocations_vnd':{'food':0,'transport':50000,'learning':0,'entertainment':0,'savings':0}})))
    check('energy_baseline',lambda:calculate('9.1',{'hours':{'lights':6,'fans':6,'computers':2}})['cost_vnd']==8500)
    check('energy_reduced',lambda:calculate('9.1',{'hours':{'lights':4,'fans':4,'computers':1}})['saved_vnd']==3250)
    check('energy_domain',lambda:invalid(lambda:calculate('9.1',{'hours':{'lights':0,'fans':6,'computers':2}})))
    check('saving_6months',lambda:calculate('9.2',{'monthly_savings_vnd':100000})['months_to_goal']==6)
    check('saving_4months',lambda:calculate('9.2',{'monthly_savings_vnd':150000})['months_to_goal']==4)
    check('saving_after_event',lambda:invalid(lambda:calculate('9.2',{'monthly_savings_vnd':150000},True)))
    check('saving_zero',lambda:calculate('9.2',{'monthly_savings_vnd':0})['months_to_goal'] is None)
    skill={'skill':'planning','activities':[{'activity_id':a,'day':'MON','planned_product':'Bản ghi kết quả'} for a in ['read_summary','explain_choice','revise_choice']]}
    check('skill_105min',lambda:calculate('9.3',skill)['total_minutes']==105)
    dup=deepcopy(skill);dup['activities'][1]['activity_id']='read_summary'
    check('skill_duplicate',lambda:invalid(lambda:calculate('9.3',dup)))
    uid='11111111-1111-4111-8111-111111111111';other='22222222-2222-4222-8222-222222222222'
    coach={'origin':'AI','question':'Bạn thấy điều gì?','hint':'So sánh hai lượt.','related_attempt_ids':[uid]}
    check('coach_valid',lambda:bool(check_coach(coach,[uid])))
    check('coach_foreign_id',lambda:invalid(lambda:check_coach(coach,[other])))
    feedback={'origin':'AI','prompt_version':'v1','requires_teacher_review':True,'assessments':[{'criterion_id':k,'status':'INSUFFICIENT','comment':'Cần thêm bằng chứng.','related_attempt_ids':[uid],'reflection_id':other} for k in ['EV-01','EV-02','EV-03']]}
    check('feedback_valid',lambda:bool(check_feedback(feedback,[uid],other,False)))
    bad=deepcopy(feedback);bad['assessments'][2]['status']='SUPPORTED'
    check('feedback_fake_adjustment',lambda:invalid(lambda:check_feedback(bad,[uid],other,False)))
    bad=deepcopy(feedback);bad['assessments'][2]['criterion_id']='EV-01'
    check('feedback_duplicate_criterion',lambda:invalid(lambda:check_feedback(bad,[uid],other,False)))
    doc=json.loads((ROOT/'openapi.json').read_text(encoding='utf-8'))
    operations=[]
    def walk(v):
        if isinstance(v,dict):
            if '$ref' in v:
                r=v['$ref'];assert r.startswith('#/');target=doc
                for part in r[2:].split('/'):target=target[part.replace('~1','/').replace('~0','~')]
            for c in v.values():walk(c)
        elif isinstance(v,list):
            for c in v:walk(c)
    walk(doc)
    for route,methods in doc['paths'].items():
        for method,op in methods.items():
            operations.append(op['operationId'])
            assert any(k.startswith('2') for k in op['responses'])
            if method in ['post','patch'] and route!='/auth/login':assert any(p['name']=='X-CSRF-Token' for p in op.get('parameters',[]))
    check('openapi_unique_operations',lambda:len(operations)==len(set(operations)))
    check('openapi_cookie_security',lambda:doc['security']==[{'sessionCookie':[]}])
    report={'scope':'Design contracts and pure reference calculations; no backend/database/camera/real LLM verified','passed':len(checks),'checks':checks,'openapi_operations':len(operations),'schemas':len(ROOT_CONTRACT['components']['schemas'])}
    (ROOT/'verification-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'passed':len(checks),'operations':len(operations),'schemas':report['schemas']}))
if __name__=='__main__':main()
