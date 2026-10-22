const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
for(const entry of manifest.workflows){const w=JSON.parse(fs.readFileSync(path.join(root,entry.file),'utf8')),role=path.basename(entry.file,'.json');for(const n of w.nodes){if(!n.type.endsWith('.code'))continue;const slug=n.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const file=path.join(root,'src',role,slug+'.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,n.parameters.jsCode,'utf8');}}
console.log('Extracted Code nodes from canonical workflow JSON.');
