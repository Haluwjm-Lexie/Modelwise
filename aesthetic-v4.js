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


// V4.2 · One-screen AI Daily product introduction. No extra content below the hero.
function mwRenderAIDailyOverview(){
  if(location.hash!=='#aidaily')return;
  document.body.classList.add('mw-explore-view');
  document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav==='aidaily'));
  const dock=document.getElementById('compare-dock');
  if(dock)dock.classList.add('hidden');
  const app=document.getElementById('app');
  if(!app)return;
  app.innerHTML=`<section class="mw-explore" aria-label="探索 AI Daily 作品概览">
    <div class="mw-explore-copy">
      <div class="mw-explore-kicker"><i aria-hidden="true"></i> LEXIE / AI INTELLIGENCE</div>
      <div class="mw-explore-wordmark"><span class="mw-explore-mark">A<i></i></span><span><b>AI</b> Daily</span></div>
      <h1>让 AI 信息<br>成为你的<span>长期积累。</span></h1>
      <p class="mw-explore-lead">每天读懂 AI，持续看见趋势。</p>
      <p class="mw-explore-description">AI Daily 是一款独立的 AI 情报阅读器。将每日 AI 动态、开源趋势与长期观察整理成清晰、可回顾的个人信息档案。</p>
      <div class="mw-explore-tags" aria-label="AI Daily 主要功能">
        <span>AI 日报 · 周报</span><span>GitHub Trending</span><span>趋势分析</span><span>收藏与归档</span>
      </div>
      <div class="mw-explore-actions">
        <a class="mw-explore-primary" href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer">进入 AI Daily <span aria-hidden="true">↗</span></a>
        <a class="mw-explore-back" href="#library">返回模型资料库</a>
      </div>
      <p class="mw-explore-note">独立网站 · 点击进入 AI 日报首页</p>
    </div>
    <div class="mw-explore-visual">
      <a class="mw-explore-browser" href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer" aria-label="打开 AI Daily 日报首页">
        <div class="mw-explore-browserbar"><span class="mw-explore-dots"><i></i><i></i><i></i></span><span>AI Daily / AI 日报</span><span class="mw-explore-arrow">↗</span></div>
        <div class="mw-explore-screen"><img src="assets/ai-daily-real-preview.png" alt="真实 AI Daily 产品首页截图：AI 日报、往期刊物和阅读界面" loading="eager" decoding="async"></div>
      </a>
      <div class="mw-explore-float"><strong>AI Daily</strong><span>日报 · 开源 · 趋势 · 归档</span></div>
    </div>
  </section>`;
  window.scrollTo(0,0);
}
function mwExploreSync(){
  document.body.classList.toggle('mw-explore-view',location.hash==='#aidaily');
  if(location.hash==='#aidaily')mwRenderAIDailyOverview();
}
window.addEventListener('hashchange',mwExploreSync);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mwExploreSync);
else mwExploreSync();
