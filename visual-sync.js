'use strict';
function syncCompanyVisuals(){document.body.classList.toggle('company-view',location.hash.startsWith('#company/'));}
syncCompanyVisuals();
window.addEventListener('hashchange',syncCompanyVisuals);

const renderCompactCompanyTimeline=renderTimeline;
renderTimeline=function(){
  renderCompactCompanyTimeline();
  const rows=timelineItems();
  document.querySelectorAll('#history-scroll .time-card').forEach((card,index)=>{
    const evidence=rows[index]?.evidence;
    if(evidence)card.insertAdjacentHTML('beforeend',`<span class="time-source">动态来源：${esc(evidence)}</span>`);
  });
};
