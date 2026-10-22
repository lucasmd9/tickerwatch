const c=$input.first().json;return [{json:{event_id:c.event.event_id,status:c.event.status,analysis:c.event.analysis||null,earnings:c.earnings,earnings_only:true,candidates:[]}}];
