'use strict';

const MODELWISE_AIDAILY_URL='https://haluwjm-lexie.github.io/AI-Daily/?view=daily';

function mwV4SyncChrome(){
  const mark=document.querySelector('.wordmark');
  if(mark) mark.innerHTML='M<span class="brand-o">o</span>del<span class="wise">wise</span><i></i>';

  const bottomYear=document.querySelector('.sidebar-bottom>span');
  if(bottomYear) bottomYear.remove();

  const costNav=document.querySelector('[data-nav="cost"]');
  if(costNav) costNav.innerHTML='<span>◎</span> 项目成本与收益';

  const nav=document.querySelector('nav');
  const changelog=document.querySelector('[data-nav="changelog"]');
  if(nav && changelog && !nav.querySelector('[data-nav="aidaily"]')){
    const a=document.createElement('a');
    a.className='external-nav';
    a.href='#aidaily';
    a.dataset.nav='aidaily';
    a.innerHTML='<span>✧</span> 探索 AI Daily';
    nav.insertBefore(a,changelog);
  }
}

// Remove the duplicated MODELWISE eyebrow and keep the real page title as the first visual level.
pageHead=function(title,sub,action=''){
  return `<div class="page-head"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>${action}</div>`;
};

// Keep the existing cost logic, but correct the page naming after each render.
const mwV4RenderCost=renderCost;
renderCost=function(){
  mwV4RenderCost();
  const h=document.querySelector('.page-head h1');
  if(h) h.textContent='项目成本与收益';
  const p=document.querySelector('.page-head p');
  if(p) p.textContent='把模型调用、项目投入、收益与 ROI 放在同一张账上看清楚。';
};

function mwDateLabel(date){
  if(!date) return '未标日期';
  try{
    const d=new Date(date+'T12:00:00+08:00');
    return new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(d);
  }catch{return date}
}

// Fix the current changelog crash: newer entries use summary/source, older entries use changes[].
renderChangelog=async function(){
  const d=await fetch('changelog.json').then(r=>{if(!r.ok)throw Error('无法读取 changelog.json');return r.json()});
  const items=Array.isArray(d.items)?d.items:[];
  const groups=new Map();
  for(const item of items){
    const key=item.date||d.date||'历史版本';
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(item);
  }
  const sorted=[...groups.entries()].sort((a,b)=>String(b[0]).localeCompare(String(a[0])));

  const days=sorted.map(([date,rows])=>`<section class="changelog-day">
    <div class="changelog-day-head"><h2>${esc(mwDateLabel(date))}</h2><span>${rows.length} 条记录</span></div>
    ${rows.map((x,index)=>`<article class="changelog-entry">
      <div class="changelog-entry-meta"><span>${String(index+1).padStart(2,'0')}</span><br><b>${x.source?'更新':'优化'}</b></div>
      <div><h3>${esc(x.title||'Modelwise 更新')}</h3>
        ${x.summary?`<p>${esc(x.summary)}</p>`:''}
        ${Array.isArray(x.changes)?`<ul>${x.changes.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
        ${x.source?`<p class="changelog-source">来源：${esc(x.source)}</p>`:''}
      </div>
    </article>`).join('')}
  </section>`).join('');

  const history=Array.isArray(d.history)&&d.history.length?`<section class="changelog-history">
    <div class="section-heading"><div><h2>之前的版本</h2><span>保留每一次重要迭代</span></div></div>
    <div class="report-list">${d.history.map(x=>`<article class="report-card"><div><h3>V${esc(x.version)} · ${esc(x.title)}</h3><p>${esc(x.date)}</p></div></article>`).join('')}</div>
  </section>`:'';

  $('app').innerHTML=`<div class="changelog-page">
    <div class="changelog-intro"><div><h1>更新日志</h1><p>新功能、调整、资料更新，都写在这里。</p></div></div>
    <div class="changelog-list">${days||'<div class="empty">暂时还没有更新记录。</div>'}</div>${history}
  </div>`;
};

mwV4SyncChrome();
window.addEventListener('hashchange',mwV4SyncChrome);


// V4.1 · AI Daily is a peer product: discover it before visiting its homepage.
function mwRenderAIDailyOverview(){
  if(location.hash!=='#aidaily')return;
  document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav==='aidaily'));
  const dock=document.getElementById('compare-dock');
  if(dock)dock.classList.add('hidden');
  const app=document.getElementById('app');
  if(!app)return;
  app.innerHTML=`<div class="mw-daily-page">
    <div class="mw-daily-eyebrow"><span class="mw-live-dot"></span> LEXIE · PRODUCT ECOSYSTEM</div>
    <div class="mw-daily-hero">
      <div class="mw-daily-copy">
        <div class="mw-daily-product"><span class="mw-daily-logo">A<span class="mw-daily-logo-dot">.</span></span><span>AI Daily</span></div>
        <h1>每天一点，<br>读懂 AI 世界<span class="mw-daily-period">.</span></h1>
        <p class="mw-daily-lead">让 AI 信息，成为可以积累的知识。</p>
        <p class="mw-daily-summary">AI Daily 是一个独立的 AI 情报阅读器，集中呈现 AI 日报、GitHub Trending 和长期趋势分析。用更清晰的归档与阅读体验，持续跟踪值得关注的技术和产品变化。</p>
        <div class="mw-daily-actions">
          <a class="mw-daily-cta" href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer">进入 AI 日报 <span aria-hidden="true">↗</span></a>
          <a class="mw-daily-secondary" href="#library">返回 Modelwise</a>
        </div>
        <p class="mw-daily-linkhint">独立网站 · 进入后默认打开「AI 日报」</p>
      </div>
      <div class="mw-daily-showcase">
        <div class="mw-daily-image-header"><span class="mw-daily-dots"><i></i><i></i><i></i></span><span>AI Daily / AI 日报</span><span>↗</span></div>
        <a class="mw-daily-image" href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer" aria-label="查看真实的 AI Daily 网站">
          <img src="assets/ai-daily-real-preview.png" alt="AI Daily 真实网站截图：左侧内容导航、往期日报、AI 日报正文阅读区" loading="eager" decoding="async">
        </a>
        <div class="mw-daily-image-caption">真实产品界面 · AI Daily 日报阅读页</div>
      </div>
    </div>
    <div class="mw-daily-features-title"><h2>一个入口，持续了解 AI</h2><span>EXPLORE THE FEATURES</span></div>
    <div class="mw-daily-features">
      <article><span class="mw-daily-feature-index">01</span><h3>AI 日报与往期</h3><p>阅读每日重要动态，并按日期查阅过往内容。</p></article>
      <article><span class="mw-daily-feature-index">02</span><h3>GitHub Trending</h3><p>观察热门开源项目与不同周期的技术趋势。</p></article>
      <article><span class="mw-daily-feature-index">03</span><h3>趋势分析</h3><p>从已归档的信息中寻找更长期的变化方向。</p></article>
      <article><span class="mw-daily-feature-index">04</span><h3>收藏与阅读偏好</h3><p>保存关心的内容，建立自己的 AI 信息阅读习惯。</p></article>
    </div>
    <div class="mw-daily-footerline"><span>AI Daily × Modelwise</span><a href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer">打开 AI Daily ↗</a></div>
  </div>`;
  window.scrollTo({top:0,behavior:'instant'});
}
// Registered last so the original router still handles all existing Modelwise pages.
window.addEventListener('hashchange',mwRenderAIDailyOverview);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mwRenderAIDailyOverview);
else mwRenderAIDailyOverview();
