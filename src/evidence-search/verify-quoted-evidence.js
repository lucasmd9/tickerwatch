const c=$('Keep primary page text').first().json;let parsed;let extraction_status=$json.error?'provider_error':'parsed';try{parsed=JSON.parse(String($json.text||'').replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{parsed={};extraction_status=$json.error?'provider_error':'invalid_json';}
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();const facts=[];let rejected=0;
for(const f of Array.isArray(parsed?.facts)?parsed.facts.slice(0,6):[]){
 if(!f||typeof f!=='object'){rejected++;continue;}
 let selectedExcerpt=null;if(f.excerpt_id){const mp=(c.model_pages||[]).find(p=>p.url===f.source_url);selectedExcerpt=mp?.excerpts?.find(x=>x.excerpt_id===f.excerpt_id)||null;f.quote=selectedExcerpt?.text||'';}
 const page=c.pages.find(p=>p.url===f.source_url);const q=norm(f.quote);let ok=page&&q.length>=20&&q.length<=1800&&norm(page.text).includes(q)&&norm(f.value)&&q.includes(norm(f.value));
 if(['reported_eps','reported_revenue'].includes(f.kind))ok=ok&&['period','currency','units','basis'].every(k=>norm(f[k])&&q.includes(norm(f[k])))&&!/\b(estimate|forecast|guidance|expected|projected)\b/.test(q);
 else if(f.kind==='confirmed_release_date')ok=ok&&Number.isFinite(Date.parse(f.value))&&Date.parse(f.value)>Date.now()&&/\b(will|scheduled|announce|release|publish)\b/.test(q);
 else ok=false;
 // When a supplied excerpt is a comparative table, verify the current column and row.
 const tablePeriods=selectedExcerpt?.text?.match(/\bQ[1-4]\s*FY\s*\d{2,4}(?=\b|Q[1-4])/g)||[];
 if(ok&&tablePeriods.length&&['reported_eps','reported_revenue'].includes(f.kind)){
  ok=norm(f.period)===norm(tablePeriods[0]);
  const parts=q.split(/\bnon[-\s]?gaap\b/i);const basis=norm(f.basis);
  const section=basis==='gaap'?parts[0]:/^non[-\s]?gaap$/.test(basis)?parts[1]:null;
  const pattern=f.kind==='reported_revenue'?/(?:total\s+)?revenues?\s*[:|]?\s*([$€£]?\s*[\d,]+(?:\.\d+)?)/i:/\b(?:diluted (?:earnings|income) per (?:common )?share|earnings per diluted share)\s*[:|]?\s*([$€£]?\s*[\d,]+(?:\.\d+)?)/i;
  const first=section?.match(pattern)?.[1];
  const number=s=>String(s||'').replace(/[^\d.-]/g,'');
  ok=ok&&!!first&&number(first)===number(f.value);
 }
 if(ok)facts.push(Object.fromEntries(['kind','value','period','currency','units','basis','source_url','quote'].map(k=>[k,String(f[k]||'')])));else rejected++;
}
return [{json:{earnings:{issuer_id:c.stock.issuer_id,company:c.stock.company,checked_at:new Date().toISOString(),status:facts.length?'evidence_checked':'unavailable',facts,rejected,extraction_status,source_urls:c.pages.map(p=>p.url),note:extraction_status==='invalid_json'?'Model returned incomplete or invalid JSON; no figures were accepted.':extraction_status==='provider_error'?'Extraction provider failed; no figures were accepted.':'Exact-quote checks establish traceability, not an independent accounting audit. Missing facts remain unverified.',capability_note:c.capability_note,retrieval_note:c.retrieval_note||null}}}];
