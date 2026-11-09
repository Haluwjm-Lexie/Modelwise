'use strict';

function syncCompanyVisuals(){
  document.body.classList.toggle('company-view', location.hash.startsWith('#company/'));
}
syncCompanyVisuals();
window.addEventListener('hashchange', syncCompanyVisuals);

// This final override uses the same data as Modelwise, but renders a compact,
// two-sided chronology: milestones above the rail, current highlights below.
renderTimeline = function(){
  const host = $('company-timeline');
  if (!host) return;
  const rows = timelineItems();
  const years = [...new Set(db.events.filter(e => e.tool === selectedCompany && e.date).map(e => e.date.slice(0, 4)))];
  const cards = rows.map((event, index) => {
    const side = index % 2 === 0 ? 'above' : 'below';
    const detail = String(event.ability || '').trim();
    const evidence = String(event.evidence || '').replace(/^AIHOT 主题大事记 · /, 'AIHOT · ');
    return `<article class="mw-event ${side}">
      <a class="mw-event-card" href="${link(event.source)}" target="_blank" rel="noopener" draggable="false" title="${esc(detail)}">
        <div class="mw-event-meta"><span>${esc(event.date)}</span><b>${esc(event.kind || '动态')} ↗</b></div>
        <h3>${esc(event.name)}</h3>
        ${detail && detail !== event.name ? `<p>${esc(detail)}</p>` : ''}
        ${evidence ? `<small>${esc(evidence)}</small>` : ''}
      </a><i class="mw-event-dot" aria-hidden="true"></i>
    </article>`;
  }).join('');
  host.innerHTML = `<div class="timeline-top mw-timeline-top"><div><h2>大事记</h2><span>AIHOT 主题大事记 · 左右滑动</span></div>
    <select id="timeline-year" class="year-select" aria-label="大事记年份"><option value="">全部年份</option>${years.map(y => `<option ${timelineYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
  </div>${rows.length ? `<div class="mw-timeline-scroll" id="history-scroll" tabindex="0" aria-label="模型大事记，左右滑动或拖动"><div class="mw-timeline-rail">${cards}</div></div>` : '<p class="mw-empty-timeline">这个产品的大事记正在整理中。</p>'}`;
  const scroll = $('history-scroll');
  if (scroll) {
    requestAnimationFrame(() => { scroll.scrollLeft = scroll.scrollWidth - scroll.clientWidth; });
    bindTimelineDrag(scroll);
  }
};
