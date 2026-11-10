"""Synchronize the legacy filename from the canonical full-project schema."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent
source=(ROOT/'schema.sql').read_text(encoding='utf-8')
tables=re.findall(r'CREATE TABLE (\w+)',source)
assert len(tables)==13 and len(set(tables))==13
(ROOT.parent/'schema-v2.sql').write_text(source,encoding='utf-8')
print('Synchronized canonical full-project SQL: 13 tables')
