const RM_BENCHMARKS={NASDAQ:['SPY','USD'],NYSE:['SPY','USD'],AMS:['^STOXX50E','EUR'],XETRA:['^STOXX50E','EUR'],PAR:['^STOXX50E','EUR'],LSE:['^FTSE','GBP'],TSE:['^N225','JPY'],HKEX:['^HSI','HKD'],SIX:['^SSMI','CHF']};
function rmCurrency(x){return x==='GBp'||x==='GBX'?'GBP':x;}
function rmDay(time,zone){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time*1000));}
function rmParse(body,symbol,now=Date.now()){
 const r=body?.chart?.result?.[0],m=r?.meta;
 if(!m||body.chart.error||String(m.symbol).toUpperCase()!==symbol.toUpperCase()||!m.currency||!m.exchangeTimezoneName)throw Error('Missing or mismatched Yahoo symbol metadata');
 const today=rmDay(now/1000,m.exchangeTimezoneName),q=r.indicators?.quote?.[0]?.close,a=r.indicators?.adjclose?.[0]?.adjclose;
 if(!Array.isArray(a)||!Array.isArray(q))throw Error('Adjusted closing prices unavailable');
 const points=[];for(let i=0;i<(r.timestamp||[]).length;i++){const date=rmDay(r.timestamp[i],m.exchangeTimezoneName);if(date>=today||!Number.isFinite(a[i])||a[i]<=0||!Number.isFinite(q[i])||q[i]<=0)continue;points.push({date,close:q[i],adjclose:a[i]});}
 const unique=[...new Map(points.map(p=>[p.date,p])).values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-270);
 if(!unique.length||now-Date.parse(unique.at(-1).date)>6*86400000)throw Error('No recent completed daily price session');
 return {symbol,currency:rmCurrency(m.currency),quote_currency:m.currency,exchange_timezone:m.exchangeTimezoneName,fetched_at:new Date(now).toISOString(),points:unique,source_url:'https://finance.yahoo.com/quote/'+encodeURIComponent(symbol)+'/history/'};
}
function rmApply(c,responses,plans,now=Date.now()){
 const failures=[],saved={},checked_at=new Date(now).toISOString();c.state.Meta=c.state.Meta||{};c.dirty=c.dirty||[];
 const write=(key,value)=>{c.state.Meta[key]=value;c.dirty.push({table:'Meta',key,value});};
 for(let i=0;i<plans.length;i++){const symbol=plans[i].symbol;try{const result=rmParse(responses[i]?.body||responses[i],symbol,now);saved[symbol]=result;write('market_series_'+symbol,result);}catch(e){failures.push({symbol,reason:String(e.message).slice(0,160)});}}
 const compute=(stock,key,scope,extra={})=>{
  const mapping=RM_BENCHMARKS[stock.exchange],series=saved[stock.yahoo_symbol],bench=mapping&&saved[mapping[0]],old=c.state.Meta[key];
  const fail=reason=>{if(old)write(key,{...old,stale:true,refresh_error:reason,last_refresh_attempt:checked_at});return reason;};
  if(!mapping||!series||!bench)return fail('Stock or benchmark missing from this refresh');
  if(series.currency!==mapping[1]||bench.currency!==mapping[1])return fail('Stock/benchmark currency mismatch');
  const benchmark=new Map(bench.points.map(p=>[p.date,p]));const common=series.points.filter(p=>benchmark.has(p.date));
  if(!common.length)return fail('No common completed session');const last=common.at(-1),base=old?common.find(p=>p.date===old.baseline.date):last;
  if(!base)return fail('Reference date unavailable in the one-year Yahoo history; no return inferred');
  if(old&&old.benchmark_symbol!==mapping[0])return fail('Benchmark changed; reference needs review');
  const bp=benchmark.get(base.date),lp=benchmark.get(last.date),sr=last.adjclose/base.adjclose-1,br=lp.adjclose/bp.adjclose-1;
  const value={kind:'research_outcome',scope,stock_id:stock.stock_id,symbol:stock.yahoo_symbol,benchmark_symbol:mapping[0],currency:series.currency,started_at:old?.started_at||checked_at,baseline:{date:base.date,stock_adjusted_close:base.adjclose,benchmark_adjusted_close:bp.adjclose},reference_observed:old?.reference_observed||{at:checked_at,date:base.date,stock_close:base.close,stock_quote_currency:series.quote_currency,benchmark_close:bp.close},latest:{date:last.date,stock_adjusted_close:last.adjclose,benchmark_adjusted_close:lp.adjclose},stock_return:sr,benchmark_return:br,excess_return:sr-br,fetched_at:checked_at,stale:false,method:'Yahoo adjusted-close ratios, common completed local dates, local-currency benchmark; not a trade',...extra};write(key,value);
 };
 const outcome_gaps=[];for(const stock of c.universe.slice(0,10)){const error=compute(stock,'research_outcome_'+stock.stock_id,'watchlist');if(error)outcome_gaps.push({stock_id:stock.stock_id,reason:error});}
 for(const t of Object.values(c.state.Meta).filter(t=>t.kind==='team_thesis'&&t.status==='active')){const stock=c.universe.find(s=>s.stock_id===t.stock_id);if(!stock)continue;let h=2166136261;for(const ch of t.created_at)h=Math.imul(h^ch.charCodeAt(0),16777619);compute(stock,'thesis_outcome_'+t.stock_id+'_'+(h>>>0).toString(16),'thesis',{thesis_created_at:t.created_at,hypothesis:t.hypothesis});}
 write('market_refresh',{checked_at,failures,outcome_gaps,symbols_requested:plans.length,symbols_received:Object.keys(saved).length});c.operation='write';return c;
}

const c=$('Input').first().json;const plans=$('Plan Yahoo requests').all().map(i=>i.json);const responses=$input.all().map(i=>i.json);return [{json:rmApply(c,responses,plans)}];