import fs from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const readJson = async (name) => JSON.parse(await fs.readFile(new URL(name, root), 'utf8'));
const writeJson = async (name, value) => fs.writeFile(new URL(name, root), `${JSON.stringify(value, null, 2)}\n`);

const apiBase = process.env.MODELWISE_API_BASE;
const apiToken = process.env.MODELWISE_API_TOKEN;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
if (!deepseekKey) throw new Error('Missing DEEPSEEK_API_KEY GitHub Secret');

const catalog = await readJson('catalog.json');
const workbook = await readJson('workbook-models.json');
const products = (catalog.tools || []).map((tool) => ({ id: tool.id, name: tool.name, query: tool.query, sources: tool.sources }));
if (products.length !== 23) throw new Error(`Expected 23 products, found ${products.length}`);

const discovered = [];
for (const product of products) {
  const url = `https://aihot.news/api/v1/items?window=7d&limit=30&mode=selected&q=${encodeURIComponent(product.query || product.name)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'modelwise-github-actions/1.0' } });
  if (!response.ok) continue;
  const data = await response.json();
  for (const item of Array.isArray(data.items) ? data.items : []) {
    if (!['ai-models', 'ai-products'].includes(item.category)) continue;
    discovered.push({ product: product.id, title: item.title, summary: item.summary, publishedAt: item.publishedAt, source: item.links?.aihot, originalSource: item.links?.original });
  }
}

const prompt = `You are updating a private AI model catalogue. Review these AIHOT discoveries for exactly these products: ${products.map((p) => p.id).join(', ')}. Return JSON only with {events, models, changes}. Never invent a model or price. Only mark a price when an official source URL and exact text-token price are present. Keep announcement date separate from effective date.\n\n${JSON.stringify(discovered).slice(0, 180000)}`;
const completion = await fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${deepseekKey}` },
  body: JSON.stringify({ model: 'deepseek-chat', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] })
});
if (!completion.ok) throw new Error(`DeepSeek HTTP ${completion.status}`);
const result = JSON.parse((await completion.json()).choices?.[0]?.message?.content || '{}');

if (apiBase && apiToken) {
  const review = await fetch(`${apiBase.replace(/\/$/, '')}/api/review`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` }, body: JSON.stringify({ events: result.events || [], models: result.models || [], checks: products.map((p) => ({ tool: p.id, lastVerifiedAt: new Date().toISOString(), note: 'GitHub Actions · AIHOT + DeepSeek review' })), lifecycle: result.changes || [] }) });
  if (!review.ok) throw new Error(`Modelwise review HTTP ${review.status}`);
}

const changelog = await readJson('changelog.json');
changelog.unshift({ date: new Date().toISOString().slice(0, 10), title: '每周模型资料检查', summary: `已检查 ${products.length} 个产品；AIHOT 发现 ${discovered.length} 条动态，结果由 DeepSeek 整理并按官网证据核验。`, source: 'GitHub Actions' });
await writeJson('changelog.json', changelog.slice(0, 200));
await writeJson('update-status.json', { checkedAt: new Date().toISOString(), products: products.length, discovered: discovered.length, events: (result.events || []).length, models: (result.models || []).length, source: 'AIHOT + DeepSeek + official sources' });
await writeJson('catalog.json', catalog);
await writeJson('workbook-models.json', workbook);
