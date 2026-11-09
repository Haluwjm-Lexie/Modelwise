'use strict';

const MODELWISE_AIDAILY_URL='https://haluwjm-lexie.github.io/AI-Daily/?view=models';

function mwV4SyncChrome(){
  const mark=document.querySelector('.wordmark');
  if(mark) mark.innerHTML='M<span class="brand-o">o</span>del<span class="wise">wise</span><i></i>';

  const bottomYear=document.querySelector('.sidebar-bottom>span');
  if(bottomYear) bottomYear.remove();

  const costNav=document.querySelector('[data-nav="cost"]');
  if(costNav) costNav.innerHTML='<span>◎</span> 项目成本与收益';

  const nav=document.querySelector('nav');
  const changelog=document.querySelector('[data-nav="changelog"]');
  if(nav && changelog && !nav.querySelector('.external-nav')){
    const a=document.createElement('a');
    a.className='external-nav';
    a.href=MODELWISE_AIDAILY_URL;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.innerHTML='<span>↗</span> 返回 AI Daily';
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
    <div class="changelog-intro"><div><h1>更新日志</h1><p>新功能、调整、资料更新，都写在这里。</p></div><a class="changelog-return" href="${MODELWISE_AIDAILY_URL}" target="_blank" rel="noopener noreferrer">返回 AI Daily ↗</a></div>
    <div class="changelog-list">${days||'<div class="empty">暂时还没有更新记录。</div>'}</div>${history}
  </div>`;
};

mwV4SyncChrome();
window.addEventListener('hashchange',mwV4SyncChrome);
