// Refresh row context after each prior chunk; never replace a later sent state with an old snapshot.
let c=JSON.parse(JSON.stringify($input.first().json));
if(!c.ephemeral){
const b=c.state.Briefings[c.briefing_key];const chunk=b.chunks[c.chunk.index];if(b.content_review_required||!['pending','failed'].includes(chunk.status)){c.skip_delivery_chunk=true;return [{json:c}];}chunk.status='inflight';chunk.attempts++;chunk.last_attempt_at=new Date().toISOString();c.chunk=chunk;c.dirty=[{table:'Briefings',key:b.key,value:b}];}else c.dirty=[];
c.operation='write';return [{json:c}];
