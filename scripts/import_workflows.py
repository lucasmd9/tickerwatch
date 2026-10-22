"""Import the manifest-listed workflows into this Compose stack; never publish or run them."""
import json,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
def run(*args):subprocess.run(args,cwd=ROOT,check=True)
with tempfile.TemporaryDirectory(prefix='tickerwatch-import-') as temp:
 stage=Path(temp)
 for entry in manifest['workflows']:
  source=(ROOT/entry['file']).resolve()
  if not source.is_relative_to(ROOT/'workflows'):raise ValueError('Unexpected workflow path')
  (stage/source.name).write_bytes(source.read_bytes())
 run('docker','compose','cp',str(stage),'n8n:/tmp/tickerwatch-import')
 run('docker','compose','exec','-T','n8n','n8n','import:workflow','--separate','--input=/tmp/tickerwatch-import')
print('Imported project workflows inactive. Configure credentials and Settings before publishing.')
