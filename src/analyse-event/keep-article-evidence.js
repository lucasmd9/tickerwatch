const c=JSON.parse(JSON.stringify($('Choose matching public article').first().json)),r=$input.first().json;const text=String(r.article_text||'').replace(/\s+/g,' ').trim();
const titleWords=String(c.article_title||c.event.title).toLowerCase().split(/\W+/).filter(w=>w.length>4);const overlap=titleWords.filter(w=>text.toLowerCase().includes(w)).length/Math.max(1,titleWords.length);
if(text.length>=500&&overlap>=0.5&&!/access denied|just a moment|verify you are human|403 forbidden|subscribe to continue|to read the full article|enable javascript and cookies/i.test(text)){
 const words=String(c.article_title||c.event.title).toLowerCase().split(/\W+/).filter(w=>w.length>4).slice(0,5);const lower=text.toLowerCase();const starts=words.map(w=>lower.indexOf(w)).filter(i=>i>=0);const start=starts.length?Math.max(0,Math.min(...starts)-200):0;
 c.event.article_evidence={url:c.article_url,title:c.article_title,text:text.slice(start,start+12000),checked_at:new Date().toISOString(),scope:'public_article_text_excerpt'};c.event.evidence_scope='article_text_excerpt';c.article_fetch_status='retrieved';
}else c.article_fetch_status=r.error?'page_failed':'no_readable_public_text';return [{json:c}];
