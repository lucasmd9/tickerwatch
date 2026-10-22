const c=JSON.parse(JSON.stringify($('Input').first().json));
const r=$input.first().json;
if(!Array.isArray(r.valueRanges)) throw new Error('Sheets did not return database ranges. Check credential and spreadsheet ID.');
c.state={};c.rows={};c.nextRows={};c.dirty=[];
const names=['Universe','Events','ImpactLinks','Earnings','Runs','Briefings','Meta'];
for(let i=0;i<names.length;i++){
 const name=names[i],v=r.valueRanges[i]?.values||[];
 if(!v.length)throw new Error('Missing headers in '+name+'. Run Setup Database once.');
 if(name==='Universe'){
  const h=v[0];c.universe=v.slice(1).filter(a=>a[0]).map(a=>Object.fromEntries(h.map((k,j)=>[k,String(a[j]??'').trim()])));
  const ids=new Set();for(const s of c.universe){if(!s.stock_id||!s.issuer_id||!s.ticker||!s.exchange||!s.yahoo_symbol||!s.company)throw new Error('Incomplete Universe row '+s.stock_id);if(ids.has(s.stock_id))throw new Error('Duplicate stock_id '+s.stock_id);ids.add(s.stock_id);}
 }else{
  c.state[name]={};c.rows[name]={};c.nextRows[name]=v.length+1;
  for(let j=1;j<v.length;j++){const [k,raw]=v[j];if(!k)continue;try{c.state[name][k]=JSON.parse(raw);}catch{throw new Error('Invalid stored JSON: '+name+' row '+(j+1));}c.rows[name][k]=j+1;}
 }
}
return [{json:c}];
