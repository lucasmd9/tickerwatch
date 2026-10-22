const c=$input.first().json;const cached=c.state.Earnings[c.stock.issuer_id];
c.search_allowed=false;c.dirty=[];

// The compact reply can use saved, correctly mapped provider EPS without a new primary-source model call.
const history=c.state.Meta?.['av_history_'+c.stock.stock_id];
if(!c.display_detail&&history?.status==='ok'&&history.results?.length&&Date.now()-Date.parse(history.checked_at)<7*86400000){
 c.earnings=cached?.status==='evidence_checked'&&Date.now()-Date.parse(cached.checked_at)<86400000?cached:{issuer_id:c.stock.issuer_id,company:c.stock.company,status:'unavailable',facts:[],checked_at:history.checked_at,note:'Compact reply uses separate provider-reported EPS; use details for issuer-source retrieval.'};
 c.cache_hit=true;c.operation='write';return [{json:c}];
}

if(cached&&Date.now()-Date.parse(cached.checked_at)<(cached.status==='evidence_checked'?86400000:900000)){c.earnings=cached;c.cache_hit=true;}
else{const key='search_budget_'+new Date().toISOString().slice(0,10);const b=c.state.Meta[key]||{attempts_reserved:0,credits_reserved:0};if(b.attempts_reserved+3<=c.cfg.max_search_attempts_daily&&b.credits_reserved+3<=c.cfg.max_search_credits_daily){b.attempts_reserved+=3;b.credits_reserved+=3;c.dirty.push({table:'Meta',key,value:b});c.search_allowed=true;}else c.earnings={issuer_id:c.stock.issuer_id,company:c.stock.company,checked_at:new Date().toISOString(),status:'deferred',facts:[],note:'Daily search budget exhausted. Try tomorrow; no estimated actuals.'};}
c.operation='write';return [{json:c}];
