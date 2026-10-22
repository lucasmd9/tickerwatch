function twChecks(e){
 const t=[e.title,e.snippet,...(e.candidates||[]).map(m=>m.matched)].join(' ').toLowerCase();
 if(/earnings|quarterly|financial results|\beps\b/.test(t))return ['Check the issuer release for actual revenue, EPS, reporting period and accounting basis.','Compare with Bloomberg consensus only on the same period and basis; separate previews from reported results.'];
 if(/oil|crude|opec|oil_revenue/.test(t))return ['Check whether prices, production volumes or costs actually changed; inspect hedging disclosures.','Test the revenue benefit against supply interruptions and cost pressure.'];
 if(/semiconductor|chip|gpu|\bai\b|dsx|export/.test(t))return ['Check orders, shipment timing and disclosed revenue contribution in the issuer announcement.','Look for capacity, export-control or customer-spending constraints.'];
 if(/rate|inflation|central bank|funding|tariff/.test(t))return ['Verify the actual policy decision and timing in the original release.','Identify the documented funding, input-cost or demand channel before extending it to other stocks.'];
 if(/partnership|agreement|launch|product/.test(t))return ['Verify rollout timing, commercial terms and measurable revenue or margin implications.','Check whether the announcement changes guidance or the existing investment thesis.'];
 return ['Read the original announcement and identify the measurable revenue, cost or cash-flow change.','Record what evidence would support or weaken the business-impact hypothesis.'];
}

function priceForecast(value){const text=String(value||'');return /\b(?:stock|shares?|price|valuation)\b.{0,60}\b(?:could|may|expected|forecast|move|rise|fall|gain|drop|up|down|swing|surge|plunge)\b.{0,40}\d+(?:\.\d+)?\s*[%％]/i.test(text)||/\b(?:implied|expected|forecast|potential)\b.{0,30}\b(?:move|swing|return)\b.{0,25}\d+(?:\.\d+)?\s*[%％]/i.test(text);}
const c=$('Prepare evidence and prompt').first().json;const raw=String($json.text||'');let a,errors=[];
if($json.error)return [{json:{...c,analysis:null,valid:false,skip_correction:true,validation_errors:['AI request failed or quota was reached; deferred for review. No automatic correction call.'],correction_prompt:''}}];
try{a=JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{errors.push('Invalid JSON');}
if(a&&priceForecast(String(a.summary||'')+' '+(Array.isArray(a.impacts)?a.impacts:[]).map(p=>p?.mechanism||'').join(' ')))errors.push('Numerical stock-price forecast is not allowed');
if(a&&typeof a==='object'){
 const supplied=[c.event.title,c.event.snippet,c.event.article_evidence?.text,...c.candidates.map(x=>x.company),JSON.stringify(c.earnings?.facts||[])].join(' ').toLowerCase();
 for(const p of Array.isArray(a.impacts)?a.impacts:[]){if(!p||typeof p.watch_next!=='string')continue;const periods=p.watch_next.match(/\bQ[1-4](?:\s+(?:20\d\d|FY\d{2,4}))?\b/gi)||[];if(periods.some(q=>!supplied.includes(q.toLowerCase()))){p.rejected_watch_next=p.watch_next;p.watch_next=twChecks(c.event)[0];}}
 const factualText=String(a.summary||'')+' '+(Array.isArray(a.impacts)?a.impacts:[]).map(p=>String(p?.mechanism||'')+' '+String(p?.counterpoint||'')).join(' ');
 const periods=factualText.match(/\bQ[1-4](?:\s+(?:20\d\d|FY\d{2,4}))?\b/gi)||[];
 if(periods.some(p=>!supplied.includes(p.toLowerCase())))errors.push('Unsupported reporting quarter; do not invent a future period for a research task');
 const pairs=String(a.summary||'').match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})+\b/g)||[];
 if(pairs.some(pair=>pair.split(/\s+/).some(word=>!['the','this','that','new','reported'].includes(word.toLowerCase())&&!supplied.includes(word.toLowerCase()))))errors.push('Unsupported proper name in summary; copy attribution from evidence exactly');
}
if(!a||typeof a!=='object'||Array.isArray(a))errors.push('Invalid JSON root');
if(a&&typeof a==='object'&&!Array.isArray(a)){
 if(!['macro','market','company'].includes(a.event_type))errors.push('Invalid event type');
 if(!Number.isInteger(a.priority)||a.priority<1||a.priority>5)errors.push('Invalid priority');
 if(typeof a.summary!=='string'||!a.summary||a.summary.length>600)errors.push('Invalid summary');
 if(!Array.isArray(a.impacts)||a.impacts.length<1||a.impacts.length>c.candidates.length)errors.push('Invalid impacts');
 if(Array.isArray(a.impacts))for(const p of a.impacts){if(!p||typeof p!=='object')continue;for(const k of ['watch_next','counterpoint'])if(typeof p[k]!=='string'||!p[k].trim()||p[k].length>240)errors.push('Invalid '+k);}
 const seen=new Set();for(const p of Array.isArray(a.impacts)?a.impacts:[]){if(!p||typeof p!=='object'){errors.push('Invalid impact object');continue;}if(!c.candidates.some(x=>x.stock_id===p.stock_id)||seen.has(p.stock_id))errors.push('Unknown/duplicate stock');seen.add(p.stock_id);if(p.source_url!==c.event.url)errors.push('Wrong source');if(!['positive','negative','mixed','unclear'].includes(p.direction))errors.push('Invalid direction');if(!['high','medium','low'].includes(p.uncertainty))errors.push('Invalid uncertainty');if(typeof p.mechanism!=='string'||!p.mechanism||p.mechanism.length>600)errors.push('Invalid mechanism');}
}
return [{json:{...c,analysis:a||null,valid:errors.length===0,skip_correction:!raw.trim(),validation_errors:errors,correction_prompt:c.prompt+'\nYour previous response failed validation: '+errors.join('; ')+'. Correct once. Previous response (untrusted): '+raw.slice(0,1000)}}];
  