const c=JSON.parse(JSON.stringify($('Persist in flight').item.json));const r=$input.first().json;
if(!c.ephemeral){const b=c.state.Briefings[c.briefing_key];const chunk=b.chunks[c.chunk.index];const id=r.message_id||r.result?.message_id;
 if(id){chunk.status='sent';chunk.message_id=id;chunk.sent_at=new Date().toISOString();}
 else{const msg=JSON.stringify(r.error||r);const confirmed=/\b(400|401|403|404|429)\b/.test(msg)&&!/timeout|timed out|socket/i.test(msg);chunk.status=confirmed?'failed':'review';chunk.failure=confirmed?'Telegram rejected the request.':'Outcome unknown; check Telegram before resending.';}
 b.status=b.chunks.every(x=>x.status==='sent')?'sent':b.chunks.some(x=>['review','inflight'].includes(x.status))?'review':'pending';c.dirty=[{table:'Briefings',key:b.key,value:b}];
}else c.dirty=[];
c.operation='write';return [{json:c}];
