const c=JSON.parse(JSON.stringify($('Input').first().json));const data=[];
const unique=new Map();for(const x of c.dirty||[])unique.set(x.table+'|'+x.key,x);
for(const x of unique.values()){
 if(!['Events','ImpactLinks','Earnings','Runs','Briefings','Meta'].includes(x.table))throw new Error('Invalid table');
 if(!c.rows?.[x.table]||!c.nextRows?.[x.table])throw new Error('Write needs a loaded database context');
 const persisted=JSON.parse(JSON.stringify(x.value));if(x.table==='Events'&&persisted.candidates)persisted.candidates=persisted.candidates.map(m=>({stock_id:m.stock_id,match_type:m.match_type,matched:m.matched}));const text=JSON.stringify(persisted);if(text.length>45000)throw new Error('Record exceeds safe Sheets cell size: '+x.table+'/'+x.key);
 let row=c.rows[x.table][x.key];if(!row){row=c.nextRows[x.table]++;c.rows[x.table][x.key]=row;}
 if(row>10000)throw new Error('Database tab capacity reached; expand sheet rows and update configured limit.');c.state[x.table][x.key]=x.value;
 data.push({range:`${x.table}!A${row}:B${row}`,values:[[x.key,text]]});
}
c.dirty=[];return [{json:{...c,body:{valueInputOption:'RAW',data}}}];
