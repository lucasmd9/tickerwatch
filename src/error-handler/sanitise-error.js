const j=$input.first().json;const cfg=typeof j.cfg==='string'?JSON.parse(j.cfg):j.cfg;
const e={execution_id:String(j.execution?.id||''),workflow:String(j.workflow?.name||'TickerWatch'),node:String(j.execution?.lastNodeExecuted||'unknown'),at:new Date().toISOString()};
return [{json:{cfg,operation:'read',error_record:e,error_notice:'TickerWatch failed at '+e.node+'. Execution '+e.execution_id+'. Inspect n8n executions. No source credentials or raw error text are included.'}}];
