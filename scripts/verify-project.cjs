const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const ids=new Set(manifest.workflows.map(w=>w.id));let codeCount=0;
for(const entry of manifest.workflows){
 const w=JSON.parse(fs.readFileSync(path.join(root,entry.file),'utf8'));
 if(/CHECK|backup|attempt/i.test(w.name))throw Error('Non-project workflow: '+w.name);
 if(w.active!==false)throw Error('Export must be inactive: '+w.name);
 if(w.pinData||w.activeVersion||w.activeVersionId)throw Error('Runtime metadata in export');
 if(w.settings.errorWorkflow&&!ids.has(w.settings.errorWorkflow))throw Error('Unknown error workflow');
 const names=new Set(w.nodes.map(n=>n.name));
 for(const [source,ports] of Object.entries(w.connections)){if(!names.has(source))throw Error('Unknown source node');for(const branches of Object.values(ports))for(const branch of branches)for(const e of branch)if(!names.has(e.node))throw Error('Unknown target node');}
 for(const n of w.nodes){
  if(n.credentials)throw Error('Credential binding exported: '+n.name);
  if(n.type==='n8n-nodes-base.executeWorkflow'){const id=n.parameters.workflowId?.value;if(id&&!ids.has(id))throw Error('Unknown child workflow: '+id);}
  if(n.type.endsWith('.code')){new vm.Script('(function(){'+n.parameters.jsCode+'})()');const role=path.basename(entry.file,'.json'),slug=n.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(fs.readFileSync(path.join(root,'src',role,slug+'.js'),'utf8')!==n.parameters.jsCode)throw Error('Source differs from workflow: '+n.name);codeCount++;}
 }
}
function scan(dir){for(const file of fs.readdirSync(dir,{withFileTypes:true})){if(file.name==='.git'||file.name==='node_modules')continue;const p=path.join(dir,file.name);if(file.isDirectory()){scan(p);continue;}if(file.name==='.env')throw Error('Private .env must not be packaged');if(!/\.(?:json|js|cjs|py|md|yml|yaml|html|example)$/.test(file.name))continue;const s=fs.readFileSync(p,'utf8');const patterns=[/\bgh[pousr]_[A-Za-z0-9]{20,}/,/\bgsk_[A-Za-z0-9]{20,}/,/\bsk-[A-Za-z0-9_-]{24,}/,/\b\d{8,12}:[A-Za-z0-9_-]{25,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];if(patterns.some(p=>p.test(s)))throw Error('Possible secret in '+path.relative(root,p));}}
scan(root);
console.log(`Verified ${manifest.workflows.length} project workflows and ${codeCount} extracted Code nodes; references valid, no credential bindings or recognised token patterns.`);
