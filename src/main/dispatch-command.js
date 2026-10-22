const c=$input.first().json;c.original_action=c.action;
if(c.action==='stock'||c.action==='earnings'){
 const [ticker,exchange]=c.args||[];const matches=c.universe.filter(s=>ticker&&(s.ticker.toUpperCase()===ticker.toUpperCase()||s.stock_id.toUpperCase()===ticker.toUpperCase())&&(!exchange||s.exchange.toUpperCase()===exchange.toUpperCase()));
 if(matches.length!==1){c.reply=matches.length?'Ambiguous symbol. Use '+matches.map(s=>'/'+c.action+' '+s.ticker+' '+s.exchange).join(' or '):'Unknown symbol. Use /'+c.action+' TICKER EXCHANGE. See /universe.';c.action='reply';}
 else {c.stock=matches[0];if(c.action==='stock')c.action='reply';}
}else if(!['collect','retry'].includes(c.action))c.action='reply';
return [{json:c}];
