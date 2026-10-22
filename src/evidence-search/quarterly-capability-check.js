const c=$('Input').first().json;let names=[],note='Yahoo capability check unavailable';
try{const raw=String($input.first().json.response||'');const frame=raw.split('\n').filter(l=>l.startsWith('data:')).pop();const env=JSON.parse(frame?frame.slice(5):raw);names=(env.result?.tools||[]).map(t=>t.name);note=names.includes('get_financial_statements')?'Installed statement tool is not assumed quarterly. Primary-release search used.':'No verified quarterly statement adapter; primary-release search used.';}catch{}
const stock=c.stock;if(!stock)throw Error('Evidence Search requires a resolved stock');
const domains=String(stock.ir_domains||'').split('|').map(d=>d.trim().toLowerCase()).filter(d=>/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d));
// Approved issuer domains are curated in Universe, not invented by the model.
const allowed=[...new Set([...domains,'sec.gov'])];
const year=new Date().getUTCFullYear();
return [{json:{...c,capability_note:note,allowed_domains:allowed,search_body:{query:stock.company+' '+year+' latest quarterly earnings results revenue diluted EPS next earnings release date',search_depth:'basic',max_results:3,include_domains:allowed,include_raw_content:true,include_answer:false}}}];
