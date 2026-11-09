import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const timestamp = new Date().toISOString();
const deepseekKey = process.env.DEEPSEEK_API_KEY;
if (!deepseekKey) throw new Error('Missing DEEPSEEK_API_KEY GitHub Secret');

const readJson = async (name) => JSON.parse(await fs.readFile(new URL(name, root), 'utf8'));
const writeJson = async (name, value) => fs.writeFile(new URL(name, root), `${JSON.stringify(value, null, 2)}\n`);
const unique = (items) => [...new Set(items.filter(Boolean))];
const trimText = (value, limit = 14000) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
const isHttp = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
const hostname = (value) => { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return ''; } };
const safeId = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const numberOrNull = (value) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Modelwise-weekly-verifier/2.0 (+GitHub Actions)', Accept: 'text/html,application/json,text/plain;q=0.9,*/*;q=0.1' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) return { url, ok: false, error: `HTTP ${response.status}` };
    const body = trimText(await response.text());
    return body ? { url, ok: true, text: body } : { url, ok: false, error: 'Empty response' };
  } catch (error) { return { url, ok: false, error: error.message }; }
}

async function aiHot(product) {
  const queries = unique([product.name, ...(product.aliases || [])]).slice(0, 5);
  const batches = await Promise.all(queries.map(async (query) => {
    const url = `https://aihot.news/api/v1/items?window=7d&limit=30&mode=selected&q=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Modelwise-weekly-verifier/2.1' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) return [];
      const data = await response.json();
      return (Array.isArray(data.items) ? data.items : [])
        .filter((item) => ['ai-models', 'ai-products'].includes(item.category))
        .map((item) => ({ title: item.title, summary: item.summary, publishedAt: item.publishedAt, aihotSource: item.links?.aihot, originalSource: item.links?.original }));
    } catch { return []; }
  }));
  const seen = new Set();
  return batches.flat().filter((item) => {
    const key = item.aihotSource || `${item.title}|${item.publishedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function deepSeekJson(payload) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${deepseekKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: payload }] })
  });
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}`);
  const message = (await response.json()).choices?.[0]?.message?.content || '{}';
  return JSON.parse(message);
}

function allowedSource(url, domains) { return isHttp(url) && domains.has(hostname(url)); }
function hasEvent(events, item) { return events.some((event) => event.tool === item.tool && event.name === item.name && event.date === item.date); }
function hasWorkbookRecord(records, item) { return records.some((record) => record.tool === item.tool && String(record.api || '').toLowerCase() === String(item.api || '').toLowerCase()); }
function hasOffer(offers, item) { return offers.some((offer) => offer.tool === item.tool && String(offer.api || '').toLowerCase() === String(item.api || '').toLowerCase() && offer.status !== 'retired'); }

function normalize(product, answer, domains) {
  const events = [];
  const models = [];
  const offers = [];
  const lifecycle = [];
  for (const item of Array.isArray(answer.events) ? answer.events : []) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(item.announcementDate || item.date) ? (item.announcementDate || item.date) : '';
    const sourceIsAIHot = hostname(item.source) === 'aihot.news';
    if (!item.name || !item.summary || !date || (!sourceIsAIHot && !allowedSource(item.source, domains)) || !String(item.evidence || '').trim()) continue;
    events.push({ tool: product.id, date, name: String(item.name).slice(0, 180), ability: String(item.summary).slice(0, 600), source: item.source, status: item.status || '已发布', datePrecision: 'day', evidence: String(item.evidence).slice(0, 500), checked: today, kind: item.kind || '模型', effectiveDate: /^\d{4}-\d{2}-\d{2}$/.test(item.effectiveDate) ? item.effectiveDate : null });
  }
  for (const item of Array.isArray(answer.models) ? answer.models : []) {
    if (!item.api || !item.name || !item.description || !allowedSource(item.source, domains) || !String(item.evidence || '').trim()) continue;
    models.push({ tool: product.id, api: String(item.api).slice(0, 120), name: String(item.name).slice(0, 180), description: String(item.description).slice(0, 900), source: item.source, evidence: String(item.evidence).slice(0, 500), announcedAt: /^\d{4}-\d{2}-\d{2}$/.test(item.announcementDate) ? item.announcementDate : null, status: item.status || '在售' });
  }
  for (const item of Array.isArray(answer.prices) ? answer.prices : []) {
    const input = numberOrNull(item.inputPerMillionTokens), output = numberOrNull(item.outputPerMillionTokens);
    if (!item.api || !item.name || input === null || output === null || !['CNY', 'USD'].includes(item.currency) || !allowedSource(item.source, domains) || !String(item.evidence || '').trim()) continue;
    offers.push({ tool: product.id, api: String(item.api).slice(0, 120), model: String(item.name).slice(0, 180), input, output, currency: item.currency, source: item.source, note: String(item.note || '官方标准在线文字 token 单价。').slice(0, 500), status: item.status === 'scheduled' ? 'scheduled' : 'active', validUntil: /^\d{4}-\d{2}-\d{2}$/.test(item.validUntil) ? item.validUntil : null, effectiveDate: /^\d{4}-\d{2}-\d{2}$/.test(item.effectiveDate) ? item.effectiveDate : null, checked: today, maxInput: numberOrNull(item.maxInput) });
  }
  for (const item of Array.isArray(answer.lifecycle) ? answer.lifecycle : []) {
    if (!item.api || !['active', 'preview', 'scheduled', 'deprecated', 'retired', 'migrating'].includes(item.status) || !allowedSource(item.source, domains) || !String(item.evidence || '').trim()) continue;
    lifecycle.push({ api: String(item.api).slice(0, 120), status: item.status, note: String(item.note || '').slice(0, 500), source: item.source, evidence: String(item.evidence).slice(0, 500) });
  }
  return { events, models, offers, lifecycle };
}

const catalog = await readJson('catalog.json');
const workbook = await readJson('workbook-models.json');
const pricing = await readJson('pricing.json');
const changelogData = await readJson('changelog.json');
const events = Array.isArray(catalog.events) ? catalog.events : [];
const records = Array.isArray(workbook.records) ? workbook.records : [];
const offers = Array.isArray(pricing.offers) ? pricing.offers : [];
const products = Array.isArray(catalog.tools) ? catalog.tools : [];
if (products.length !== 23) throw new Error(`Expected 23 products, found ${products.length}`);

const run = { checkedAt: timestamp, products: 23, discovered: 0, officialPagesRead: 0, eventsAdded: 0, modelsAdded: 0, pricesAdded: 0, lifecycleChanged: 0, errors: [], source: 'AIHot discovery + official sources + DeepSeek structured review' };
for (const product of products) {
  const productRecords = records.filter((record) => record.tool === product.id);
  const productOffers = offers.filter((offer) => offer.tool === product.id);
  const officialUrls = unique([product.source, product.url, ...productRecords.map((record) => record.source), ...productOffers.map((offer) => offer.source)]).filter(isHttp);
  const domains = new Set(officialUrls.map(hostname));
  const [discovery, ...officialResponses] = await Promise.all([aiHot(product), ...officialUrls.map(fetchText)]);
  run.discovered += discovery.length;
  const readable = officialResponses.filter((page) => page.ok);
  run.officialPagesRead += readable.length;
  if (!readable.length) { run.errors.push({ tool: product.id, error: 'No official source page could be read; existing data retained.' }); continue; }
  const prompt = `You update one AI product in a public catalogue. Return JSON only. Do not infer, invent, or fill missing facts. AIHOT is only a lead; only official evidence below may support an update. A price may be returned only for a text model with explicit input AND output price per 1,000,000 text tokens. Never treat subscriptions, image/video/audio, per-minute/second, credits, or request prices as token prices. Keep announcementDate and effectiveDate separate. If there is no verified change, return empty arrays.\n\nProduct: ${JSON.stringify({ id: product.id, name: product.name, vendor: product.vendor, aliases: product.aliases || [] })}\nAllowed official domains: ${JSON.stringify([...domains])}\nAIHOT leads: ${JSON.stringify(discovery).slice(0, 12000)}\nOfficial source text: ${JSON.stringify(readable.map(({ url, text }) => ({ url, text }))).slice(0, 50000)}\n\nRequired JSON schema:\n{"events":[{"name":"","summary":"","kind":"模型|产品|价格|迁移","announcementDate":"YYYY-MM-DD","effectiveDate":"YYYY-MM-DD or null","status":"","source":"official URL","evidence":"short official supporting text"}],"models":[{"api":"","name":"","description":"","announcementDate":"YYYY-MM-DD or null","status":"在售|预览|下线|迁移","source":"official URL","evidence":"short official supporting text"}],"prices":[{"api":"","name":"","currency":"CNY|USD","inputPerMillionTokens":0,"outputPerMillionTokens":0,"effectiveDate":"YYYY-MM-DD or null","validUntil":"YYYY-MM-DD or null","status":"active|scheduled","note":"","source":"official URL","evidence":"short official supporting text"}],"lifecycle":[{"api":"","status":"active|preview|scheduled|deprecated|retired|migrating","note":"","source":"official URL","evidence":"short official supporting text"}]}`;
  const timelineInstruction = `\n\nTimeline policy override: AIHOT is the primary source for timeline events. If an AIHOT lead is genuinely about this product, return it in events using its aihotSource URL as source and evidence beginning "AIHOT：". When AIHOT has no relevant item, return a relevant official announcement as the fallback. Do not turn an old product/model list into a new timeline event. AIHOT is allowed only for events; models, prices, and lifecycle records still require an official URL.`;
  try {
    const changes = normalize(product, await deepSeekJson(prompt + timelineInstruction), domains);
    for (const item of changes.events) if (!hasEvent(events, item)) { item.id = `weekly-${product.id}-${safeId(item.name)}-${item.date}`; events.push(item); run.eventsAdded++; }
    for (const item of changes.models) {
      if (!hasWorkbookRecord(records, item)) {
        records.push({ id: `weekly-${product.id}-${safeId(item.api)}`, tool: product.id, company: `${product.vendor} ${product.name}`, region: product.region, family: product.name, application: product.workbookApplications || product.name, companyIntro: product.workbookIntro || product.summary || '', platform: product.url, api: item.api, description: item.description, currency: null, input: null, output: null, cacheRead: null, cacheWrite5m: null, cacheWrite1h: null, conditions: '官方已发布；尚未录入可算价的文字 token 单价。', serviceStatus: item.status, note: `公告日：${item.announcedAt || '待核实'}。${item.evidence}`, source: item.source, checked: today, provenance: { verification: 'GitHub Actions：AIHot 动态发现后，以官方页面核验' }, minInput: 0, maxInput: null, calculable: false });
        product.workbookModelCount = Number(product.workbookModelCount || 0) + 1; run.modelsAdded++;
      }
    }
    for (const item of changes.offers) {
      const existing = offers.find((offer) => offer.tool === item.tool && String(offer.api || '').toLowerCase() === item.api.toLowerCase() && offer.status !== 'retired');
      if (existing) Object.assign(existing, item); else { offers.push({ id: `weekly-${product.id}-${safeId(item.api)}`, unit: 1000000, tiers: [], ...item }); run.pricesAdded++; }
      const record = records.find((row) => row.tool === item.tool && String(row.api || '').toLowerCase() === item.api.toLowerCase());
      if (record) Object.assign(record, { currency: item.currency, input: item.input, output: item.output, serviceStatus: item.status === 'scheduled' ? '待生效' : '在售', source: item.source, checked: today, calculable: item.status !== 'scheduled', note: item.note });
    }
    for (const item of changes.lifecycle) {
      const mapped = { active: '在售', preview: '预览', scheduled: '待生效', deprecated: '已弃用', retired: '已下线', migrating: '迁移中' }[item.status];
      for (const row of records.filter((row) => row.tool === product.id && String(row.api || '').toLowerCase() === item.api.toLowerCase())) Object.assign(row, { serviceStatus: mapped, calculable: !['retired', 'deprecated', 'migrating'].includes(item.status), note: item.note || row.note, checked: today });
      for (const offer of offers.filter((offer) => offer.tool === product.id && String(offer.api || '').toLowerCase() === item.api.toLowerCase())) Object.assign(offer, { status: item.status === 'retired' ? 'retired' : item.status === 'scheduled' ? 'scheduled' : offer.status, note: item.note || offer.note, checked: today });
      run.lifecycleChanged++;
    }
    product.checked = today;
  } catch (error) { run.errors.push({ tool: product.id, error: error.message }); }
}

catalog.events = events;
catalog.checked = today;
if (Array.isArray(catalog.range)) catalog.range[1] = today;
workbook.asOf = today; workbook.importedAt = today;
pricing.checked = today;
const totalChanges = run.eventsAdded + run.modelsAdded + run.pricesAdded + run.lifecycleChanged;
if (totalChanges) {
  const items = Array.isArray(changelogData) ? changelogData : (Array.isArray(changelogData.items) ? changelogData.items : []);
  items.unshift({ date: today, title: '每周模型资料更新', summary: `已核查 23 个产品：新增大事记 ${run.eventsAdded} 条、新型号 ${run.modelsAdded} 个、价格变更 ${run.pricesAdded} 项、生命周期更新 ${run.lifecycleChanged} 项。每条更新均保留官方来源。`, source: 'GitHub Actions · AIHot + 官方来源 + DeepSeek' });
  if (Array.isArray(changelogData)) changelogData.length = 0, changelogData.push(...items.slice(0, 200)); else changelogData.items = items.slice(0, 200);
}
await Promise.all([writeJson('catalog.json', catalog), writeJson('workbook-models.json', workbook), writeJson('pricing.json', pricing), writeJson('changelog.json', changelogData), writeJson('update-status.json', run)]);
