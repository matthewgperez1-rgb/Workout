/* V7 interface: composed, not stacked weeks or repeated statistics. */
(()=>{
'use strict';
let lane='lift';
const priorPlan=planView;
planView=function(){
 const original=priorPlan();
 const host=document.createElement('div');
 host.innerHTML=original;
 const rows=[...host.querySelectorAll('.v6-lane')];
 const begin=host.querySelector('.v6-plan-top')?.outerHTML||'';
 const left=rows[0]?.outerHTML||'';
 const right=rows[1]?.outerHTML||'';
 return '<div class="v6-plan">'+begin+'<div class="t7-switch"><button class="'+(lane==='lift'?'active':'')+'" onclick="window.t7Lane(\'lift\')">Strength</button><button class="'+(lane==='run'?'active':'')+'" onclick="window.t7Lane(\'run\')">Running</button></div><div class="t7-content">'+(lane==='lift'?left:right)+'</div></div>';
};
window.t7Lane=next=>{lane=next;render()};
progress=function(){
 const completed=db.lifts.filter(l=>l.finished);
 const runs=db.runs.filter(r=>r.distance>0);
 const sets=completed.reduce((n,l)=>n+l.exercises.reduce((sum,e)=>sum+e.sets.filter(s=>s.done).length,0),0);
 const miles=runs.reduce((n,r)=>n+Number(r.distance),0);
 const stats=[['Lifting sessions',completed.length],['Working sets',sets],['Runs',runs.length],['Miles',miles.toFixed(1)]];
 let h='<div class="t7-heading">Training progress</div><div class="t7-stats">'+stats.map(x=>'<div><strong>'+x[1]+'</strong><small>'+x[0]+'</small></div>').join('')+'</div>';
 if(!completed.length&&!runs.length)return h+'<p class="t7-info">Completed workouts and Garmin runs will appear here.</p>';
 if(completed.length)h+='<div class="t7-panel"><h3>Recent strength</h3>'+completed.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(x=>'<div class="t5-line"><span>'+dateShort(x.date)+' · '+escapeHTML(x.session)+'</span><span>'+x.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0)+' sets</span></div>').join('')+'</div>';
 if(runs.length)h+='<div class="t7-panel"><h3>Recent running</h3>'+runs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(x=>'<div class="t5-line"><span>'+dateShort(x.date)+'</span><span>'+x.distance+' mi · '+pace(x.distance,x.minutes*60+x.seconds)+'/mi</span></div>').join('')+'</div>';
 return h;
};
const originalEditor=sessionEditor;
sessionEditor=function(date){
 originalEditor(date);
 const root=document.querySelector('#main');
 const panel=root?.querySelector('.card');
 if(!panel)return;
 const timer=root.querySelector('.tlg-timer');
 if(timer)timer.style.top='0';
 panel.querySelectorAll('.exercise').forEach(node=>{
  node.style.borderColor='#e0e6e2';
  const title=node.querySelector('.row strong');
  if(title)title.style.fontSize='16px';
 });
};
})();
