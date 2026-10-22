from pathlib import Path
from PIL import Image
from hashlib import sha256
import json
root=Path.cwd().resolve(); public=(root/'terminal-public').resolve(); archive=(root.parent/'references'/'asset-originals-ui53').resolve()
assert archive.is_relative_to(root.parent) and public.is_relative_to(root)
texts=[p for folder in ['src','tests'] for p in (root/folder).rglob('*') if p.is_file() and p.suffix in ['.ts','.tsx','.css','.html']]
contents={p:p.read_text(encoding='utf-8-sig') for p in texts};records=[]
for source in sorted(public.rglob('*.png')):
 if source.stat().st_size<500_000 or 'official' in source.parts:continue
 url='/'+source.relative_to(public).as_posix()
 if not any(url in s for s in contents.values()):continue
 im=Image.open(source); target=source.with_suffix('.webp');assert not target.exists(),target
 im.save(target,'WEBP',lossless=True,method=6,exact=True)
 if target.stat().st_size>source.stat().st_size*.85:target.unlink();continue
 decoded=Image.open(target)
 assert im.size==decoded.size and im.convert('RGBA').tobytes()==decoded.convert('RGBA').tobytes(),source
 newurl='/'+target.relative_to(public).as_posix()
 for p,s in contents.items():
  if url in s:contents[p]=s.replace(url,newurl)
 records.append({'original':url,'asset':newurl,'before':source.stat().st_size,'after':target.stat().st_size,'pixelsSHA256':sha256(im.convert('RGBA').tobytes()).hexdigest()})
 original=archive/source.relative_to(public);assert original.resolve().is_relative_to(archive);original.parent.mkdir(parents=True,exist_ok=True);source.replace(original)
for p,s in contents.items():
 if p.read_text(encoding='utf-8-sig')!=s:p.write_text(s,encoding='utf-8')
(root/'scripts'/'asset-compression-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'compressed':len(records),'beforeBytes':sum(r['before'] for r in records),'afterBytes':sum(r['after'] for r in records),'originals':str(archive)},ensure_ascii=False))
