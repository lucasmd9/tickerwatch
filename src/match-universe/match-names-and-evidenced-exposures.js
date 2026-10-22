function priceForecast(value){const text=String(value||'');return /\b(?:stock|shares?|price|valuation)\b.{0,60}\b(?:could|may|expected|forecast|move|rise|fall|gain|drop|up|down|swing|surge|plunge)\b.{0,40}\d+(?:\.\d+)?\s*[%％]/i.test(text)||/\b(?:implied|expected|forecast|potential)\b.{0,30}\b(?:move|swing|return)\b.{0,25}\d+(?:\.\d+)?\s*[%％]/i.test(text);}
const c=$input.first().json;
// Reviewed exposure overrides are used only when the Universe row has no tags.
for(const s of c.universe){const x=(c.cfg.reviewed_exposures||[]).find(x=>x.stock_id===s.stock_id);if(x&&!String(s.exposure_tags||'').trim())Object.assign(s,{exposure_tags:x.exposure_tags,exposure_evidence_url:x.exposure_evidence_url,reviewed_on:x.reviewed_on});}
const themes=[
 ['fuel_costs',/\b(oil|crude|jet fuel|diesel|opec)\b/i],['oil_revenue',/\b(oil|crude|opec)\b/i],
 ['us_demand',/\b(us|u\.s\.|united states|american)\b.{0,60}\b(demand|consumer|recession|growth|tariff)/i],
 ['euro_funding',/\b(ecb|european central bank|eurozone|euro area)\b.{0,90}\b(rate|inflation|credit|funding)/i],
 ['usd_funding',/\b(federal reserve|fed|us interest rates)\b/i],
 ['china_demand',/\b(china|chinese)\b.{0,70}\b(demand|growth|stimulus|consumer|tariff)/i],
 ['semiconductors',/\b(semiconductor|chips|chip export|chipmaking)\b/i],
 ['trade_tariffs',/\b(tariff|trade war|export restriction|export ban)\b/i]
];
function norm(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
for(const e of c.queue||[]){
 const title=String(e.title||'');
 if(priceForecast(title)){e.status='filtered';e.filter_reason='Numerical stock-price forecast';c.state.Events[e.event_id]=e;c.dirty.push({table:'Events',key:e.event_id,value:e});continue;}
 if(/\b(prediction|stocks? to (buy|own)|undervalued stocks?|should you (buy|sell|be worried)|millionaire|could (soar|skyrocket)|stock is going to soar|best stocks to)\b/i.test(title)){e.status='filtered';e.filter_reason='Investment opinion / stock-picking headline';c.state.Events[e.event_id]=e;c.dirty.push({table:'Events',key:e.event_id,value:e});continue;}
 const hay=' '+norm(e.title+' '+e.snippet)+' ';const candidates=[];
 for(const s of c.universe){
  const aliases=[s.company,...String(s.aliases||'').split('|')].map(norm).filter(a=>a.length>=4);
  let alias=aliases.find(a=>hay.includes(' '+a+' '));
  // A subsidiary-only mention does not prove a parent-company development.
  if(s.issuer_id==='tencent'&&/tencent music/i.test(e.title)&&!/tencent holdings|tencent cloud|0700/.test(String(e.title).toLowerCase()))alias=null;
  if(alias)candidates.push({stock_id:s.stock_id,issuer_id:s.issuer_id,company:s.company,match_type:'direct',matched:alias,evidence_url:e.url});
  else if(/^https?:\/\//.test(s.exposure_evidence_url||'')&&/^\d{4}-\d{2}-\d{2}$/.test(s.reviewed_on||'')){
   const tags=String(s.exposure_tags||'').split('|');const hits=themes.filter(([tag,re])=>tags.includes(tag)&&re.test(e.title+' '+e.snippet)).map(x=>x[0]);
   if(hits.length)candidates.push({stock_id:s.stock_id,issuer_id:s.issuer_id,company:s.company,match_type:'indirect',matched:hits.join('|'),evidence_url:s.exposure_evidence_url,reviewed_on:s.reviewed_on});
  }
 }
 e.candidates=candidates;e.universe_rows_considered=c.universe.length;e.universe_version=c.cfg.universe_version;
 e.status=candidates.length?'pending':'filtered';c.state.Events[e.event_id]=e;c.dirty.push({table:'Events',key:e.event_id,value:e});
}
return [{json:c}];
  