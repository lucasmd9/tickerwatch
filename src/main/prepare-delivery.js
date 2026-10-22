const c=$input.first().json;
let reports=[];
if(c.action==='collect')reports=Object.values(c.state.Briefings).filter(b=>Date.now()-Date.parse(b.created_at)<3*86400000).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at));
else if(c.briefing_key)reports=[c.state.Briefings[c.briefing_key]];
const jobs=[];
for(const b of reports.filter(b=>!b.content_review_required))for(const chunk of b.chunks||[])if(['pending','failed'].includes(chunk.status)&&chunk.attempts<3)jobs.push({json:{...c,briefing_key:b.key,chunk,ephemeral:false}});
if(!jobs.length&&c.action==='retry')return [{json:{...c,ephemeral:true,chunk:{index:0,text:'No pending or confirmed failed deliveries eligible for retry. Ambiguous/in-flight deliveries require checking Telegram first.'}}}];
return jobs;
