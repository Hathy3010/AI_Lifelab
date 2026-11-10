from pathlib import Path
import xml.etree.ElementTree as ET
import json,re,zipfile

ROOT=Path(__file__).resolve().parent
checks=[]
def check(name,condition):
 assert condition,name
 checks.append({'name':name,'passed':True})

tree=ET.parse(ROOT/'AI-LifeLab-System-v2.drawio')
check('nine_editable_pages',len(tree.findall('diagram'))==9)
for page in tree.findall('diagram'):
 cells=page.find('mxGraphModel/root');ids=[c.get('id') for c in cells]
 check(page.get('id')+'_unique_ids',len(set(ids))==len(ids))
 check(page.get('id')+'_edge_references',all(c.get('source') in ids and c.get('target') in ids for c in cells if c.get('edge')=='1' and c.get('source')))
 svg=ET.parse(ROOT/'diagrams'/(page.get('id')+'.svg')).getroot()
 check(page.get('id')+'_svg_parse',svg.tag.endswith('svg'))

sql=(ROOT/'schema-v2.sql').read_text(encoding='utf-8')
tables=re.findall(r'CREATE TABLE (\w+)',sql)
check('thirteen_unique_tables',len(tables)==13 and len(set(tables))==13)
check('one_canonical_schema',sql==(ROOT/'database/schema.sql').read_text(encoding='utf-8'))
check('student_unique_identity','UNIQUE (school_code,student_code)' in sql)
check('prediction_same_session_fk','FOREIGN KEY (prediction_id,session_id) REFERENCES predictions(id,session_id)' in sql)
check('prediction_single_use','prediction_id uuid UNIQUE' in sql)

def simulate(placements):
 assert {p['object_id'] for p in placements}=={'A','B'} and len(placements)==2
 slots=[p['slot'] for p in placements]
 assert all(type(x) is int and x in [-4,-3,-2,-1,1,2,3,4] for x in slots)
 assert len(set(slots))==2 and min(slots)<0<max(slots)
 torque=sum({'A':1,'B':2}[p['object_id']]*9.8*p['slot']*.1 for p in placements)
 return torque,'BALANCED' if abs(torque)<=.01 else 'RIGHT_DOWN' if torque>0 else 'LEFT_DOWN'
data=json.loads((ROOT/'contracts-v2.json').read_text(encoding='utf-8'))
net,state=simulate(data['attempt_request_example']['placements'])
check('balanced_example',abs(net)<1e-9 and state=='BALANCED')
net,state=simulate([{'object_id':'A','slot':-2},{'object_id':'B','slot':2}])
check('right_down_example',abs(net-1.96)<1e-9 and state=='RIGHT_DOWN')
net,state=simulate([{'object_id':'A','slot':4},{'object_id':'B','slot':-2}])
check('mirrored_balance',abs(net)<1e-9 and state=='BALANCED')
for label,plan in [('missing_object',[{'object_id':'A','slot':-1}]),('same_side',[{'object_id':'A','slot':1},{'object_id':'B','slot':2}]),('invalid_slot',[{'object_id':'A','slot':-5},{'object_id':'B','slot':2}])]:
 try:simulate(plan)
 except AssertionError:check(label+'_rejected',True)
 else:check(label+'_rejected',False)

html=(ROOT/'AI-LifeLab-Phan-tich-Thiet-ke-v2.html').read_text(encoding='utf-8')
images=re.findall(r'<img src="([^"]+)"',html)
check('nine_embedded_diagrams',len(images)==9 and all((ROOT/x).is_file() for x in images))
check('coach_context_snapshot',"context_snapshot jsonb NOT NULL" in sql)
for href in re.findall(r'href="([^"]+)"',html):
 if not href.startswith(('https://','http://','#')):check('link_'+href,(ROOT/href).is_file())
guide=ROOT/'database/AI-LifeLab-Database-Toan-du-an.html'
text=guide.read_text(encoding='utf-8')
for href in re.findall(r'(?:href|src)="([^"]+)"',text):
 if not href.startswith(('https://','http://','#')):check('database_link_'+href,(guide.parent/href).is_file())
report={'scope':'Artifact structure, design consistency and independent numerical examples; NOT camera/LLM/API/PostgreSQL integration',
 'passed':len(checks),'checks':checks,'not_tested':['real camera tracking','LLM calls','PostgreSQL execution','backend/API behavior','learning outcomes','native diagrams.net rendering']}
(ROOT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
target=ROOT.parent/'AI-LifeLab-MVP-v2.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in ROOT.rglob('*'):
  if p.is_file() and not any(x in p.parts for x in ['__pycache__','node_modules','.venv']) and p.suffix not in ['.zip','.pyc']:
   z.write(p,'AI-LifeLab-MVP-v2/'+p.relative_to(ROOT).as_posix())
print(f'Passed {len(checks)} artifact/numerical checks; packaged {target.name}')
