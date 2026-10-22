const c=JSON.parse(JSON.stringify($('Save search reservation').first().json));c.earnings=$input.first().json.earnings||c.earnings;
if(!c.earnings)c.earnings={issuer_id:c.stock.issuer_id,company:c.stock.company,status:'unavailable',facts:[],checked_at:new Date().toISOString(),note:'Results not verified.'};
c.dirty=c.cache_hit||c.earnings.status==='deferred'?[]:[{table:'Earnings',key:c.stock.issuer_id,value:c.earnings}];c.operation='write';return [{json:c}];
