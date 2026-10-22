const {source,cfg} = $('Input').first().json;
const rows = $input.all().map(i => i.json);
const bad = rows.find(x => x.error);
const allEvents = rows.filter(x => x.title && x.link).map(x => ({
  source_id: source.id, source_name: source.name, source_category: source.category,
  source_item_id: String(x.guid || x.link), title: String(x.title).slice(0,500),
  url: String(x.link), snippet: String(x.contentSnippet || x.content || '').replace(/<[^>]*>/g,' ').slice(0,3000),
  published_on: x.isoDate || x.pubDate || null,
  collected_at: new Date().toISOString(), evidence_scope: 'headline_and_feed_summary'
}));
const cap = Math.max(1, Math.min(100, Number(cfg.max_sources_articles) || 20));
const events = allEvents.sort((a,b) => (Date.parse(b.published_on)||0) - (Date.parse(a.published_on)||0)).slice(0,cap);
return [{json:{events,status:{
  id:source.id, ok:!bad, count:events.length, received_count:allEvents.length,
  possibly_truncated:allEvents.length>cap || allEvents.length>=100,
  error:bad?'Source request failed':null, coverage:'Feed items only; not exhaustive'
}}}];