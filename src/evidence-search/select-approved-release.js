const c=$('Quarterly capability check').first().json,r=$input.first().json;
const host=s=>String(s).match(/^https:\/\/([^/:?#]+)/i)?.[1]?.toLowerCase()||'';
const aliases=[c.stock.company,...String(c.stock.aliases||'').split('|')].map(s=>s.toLowerCase()).filter(s=>s.length>=4);
const candidates=(r.results||[]).filter(p=>c.allowed_domains.some(d=>host(p.url)===d||host(p.url).endsWith('.'+d))).filter(p=>aliases.some(a=>(String(p.title)+' '+String(p.content)).toLowerCase().includes(a))).filter(p=>/financial results|quarter.{0,30}results|results.{0,30}quarter|earnings release/i.test(String(p.title))).filter(p=>!/(estimate|forecast|transcript)/i.test(String(p.title)));
const page=candidates[0];return [{json:{...c,page_url:page?.url||'',page_title:page?.title||'',fallback_search_failed:!!r.error}}];
