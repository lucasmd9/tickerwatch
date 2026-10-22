const c=$input.first().json;
if(!c.universe.length)throw Error('Universe is empty. Add at least one stock before collection.');
const byIssuer=[...new Map(c.universe.map(s=>[s.issuer_id,s])).values()];const start=Number(c.state.Meta.source_cursor?.value||0)%Math.max(1,byIssuer.length);const count=Math.min(byIssuer.length,Math.max(1,Number(c.cfg.max_company_queries)||30));
const sources=[
 {kind:'rss',id:'bbc_business',name:'BBC Business',category:'market',url:'https://feeds.bbci.co.uk/news/business/rss.xml'},
 {kind:'rss',id:'bbc_world',name:'BBC World',category:'market',url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
 {kind:'rss',id:'macro_news',name:'Google News macro search',category:'macro',url:'https://news.google.com/rss/search?q='+encodeURIComponent('(inflation OR "interest rates" OR tariffs OR "oil supply") when:7d')+'&hl=en-GB&gl=GB&ceid=GB:en'}
];
for(let i=0;i<count;i++){const s=byIssuer[(start+i)%byIssuer.length];const term=(s.aliases||s.company).split('|')[0];sources.push({kind:'rss',id:'company_'+s.issuer_id,name:'Google News — '+s.company,category:'company',issuer_id:s.issuer_id,url:'https://news.google.com/rss/search?q='+encodeURIComponent('"'+term+'" (stock OR earnings OR revenue OR company) when:7d')+'&hl=en-US&gl=US&ceid=US:en'});}
return sources.map(source=>({json:{cfg:c.cfg,source,cursor_next:(start+count)%Math.max(1,byIssuer.length),issuers_checked:count,issuers_total:byIssuer.length}}));
  