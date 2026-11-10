from pathlib import Path
import zipfile

docs=Path(__file__).resolve().parent.parent
archive=docs/'AI-LifeLab-Thiet-ke-4-6.zip'
include=[
 'AI-LifeLab-Thiet-ke-CV-AI-He-thong.html','AI-LifeLab-Thiet-ke-CV-AI-He-thong.md',
 'AI-LifeLab-Yeu-cau-Bang-chung-Huong-dan.html','AI-LifeLab-Yeu-cau-Bang-chung-Huong-dan.md',
 'AI-LifeLab-Dac-ta-MVP.html','AI-LifeLab-Dac-ta-MVP.md','render_spec.py'
]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for name in include:z.write(docs/name,name)
    for file in sorted((docs/'technical').iterdir()):
        if file.is_file() and file.suffix not in ['.pyc','.zip']:z.write(file,'technical/'+file.name)
print(str(archive))
print('Bytes:',archive.stat().st_size)
