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
db.moves ||= {run:{},lift:{}};
const movedSource=(type,date)=>{
 const mapping=db.moves[type];
 const origin=Object.keys(mapping).find(k=>mapping[k]===date);
 if(origin)return origin;
 if(mapping[date])return null;
 return type==='run'?(runSpecs[date]?date:null):(plan(date)?.moves.length?date:null);
};
const plusDays=(date,days)=>{const x=new Date(date+'T12:00:00');x.setDate(x.getDate()+days);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const shortDate=date=>new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
let weekShift=0;
planView=function(){
 const base=plusDays(currentDate,weekShift*7);
 const d=new Date(base+'T12:00:00'),mon=plusDays(base,-((d.getDay()+6)%7));
 let days='';
 for(let i=0;i<7;i++){
  const date=plusDays(mon,i),run=movedSource('run',date),lift=movedSource('lift',date);
  const liftPlan=lift?plan(lift):null,runPlan=run?runSpecs[run]:null;
  let cards='';
  if(liftPlan?.moves.length)cards+='<button class="t7-slot" onclick="window.t7Open(\'lift\',\''+date+'\')"><span>LIFT</span><strong>'+escapeHTML(liftPlan.name)+'</strong><small>'+liftPlan.moves.length+' movements</small></button>';
  if(runPlan)cards+='<button class="t7-slot" onclick="window.t7Open(\'run\',\''+date+'\')"><span>RUN</span><strong>'+escapeHTML(runPlan[0])+'</strong><small>'+runPlan[1]+' min</small></button>';
  days+='<div class="t7-day"><div class="t7-daydate">'+shortDate(date)+'</div><div class="t7-slots">'+(cards||'<span class="t7-rest">Available / recovery</span>')+'</div></div>';
 }
 return '<section class="t7-calendar"><div class="t7-calhead"><h2>Training calendar</h2><div class="t7-buttons"><button onclick="window.t7MoveWeek(-1)">←</button><button onclick="window.t7Today()">Today</button><button onclick="window.t7MoveWeek(1)">→</button></div></div><div class="t7-days">'+days+'</div></section>';
};
window.t7MoveWeek=n=>{weekShift=Math.max(-2,Math.min(16,weekShift+n));render()};
window.t7Today=()=>{weekShift=0;render()};
window.t7Open=(type,date)=>{
 const source=movedSource(type,date);if(!source)return;
 const workout=type==='run'?runSpecs[source]:plan(source);
 const name=type==='run'?workout[0]:workout.name;
 const body=type==='run'?'<p>'+workout[1]+' minutes · '+escapeHTML(workout[2])+'</p>':workout.moves.map(m=>'<div class="t7-movement"><span>'+escapeHTML(m[0])+'</span><b>'+m[1]+' × '+m[2]+'</b></div>').join('');
 el('main').innerHTML='<div class="card"><button onclick="view(\'plan\')">← Calendar</button><p class="tag">'+type.toUpperCase()+'</p><h2>'+escapeHTML(name)+'</h2>'+body+'<div class="actions"><button class="primary" onclick="window.t7Log(\''+type+'\',\''+date+'\')">'+(type==='run'?'Log Garmin results':'Open lifting log')+'</button><button onclick="window.t7Reschedule(\''+type+'\',\''+source+'\')">Move to another day</button></div></div>';
};
window.t7Log=(type,date)=>{currentDate=date;view('today');if(type==='run')runEditor(date);else sessionEditor(date)};
window.t7Reschedule=(type,source)=>{
 const options=Array.from({length:15},(_,i)=>plusDays(source,i-7));
 const markup=options.map(date=>{
 const occupied=movedSource(type,date),blocked=occupied&&occupied!==source;
 return '<button '+(blocked?'disabled':'')+' onclick="window.t7ConfirmMove(\''+type+'\',\''+source+'\',\''+date+'\')">'+shortDate(date)+(blocked?' · occupied':'')+'</button>';
 }).join('');
 el('main').innerHTML='<div class="card"><button onclick="view(\'plan\')">← Calendar</button><h2>Move '+type+'</h2><p>Changes your Training Log calendar only, not Tredict.</p><div class="t7-options">'+markup+'</div></div>';
};
window.t7ConfirmMove=(type,source,date)=>{
 if(movedSource(type,date)&&movedSource(type,date)!==source)return;
 if(type==='run'&&db.runs.some(r=>r.date===source)){alert('Recorded runs cannot be rescheduled.');return}
 if(type==='lift'&&db.lifts.some(r=>r.date===source)){alert('Started lifts cannot be rescheduled.');return}
 const old=db.moves[type][source];
 if(type==='lift'&&old&&old!==source)delete db.overrides[old];
 if(date===source){delete db.moves[type][source];}
 else {db.moves[type][source]=date;if(type==='lift')db.overrides[date]=plan(source);}
 persist();view('plan');
};

const oldToday=today;
today=function(){
 const p=oldToday();
 const sourceLift=movedSource('lift',currentDate);
 const sourceRun=movedSource('run',currentDate);
 // When rescheduled, show the calendar as the authoritative source of planned sessions.
 const card=(kind,source)=>{
  if(!source)return '<section class="v6-now-card"><div class="tag">'+kind+'</div><h2>No scheduled '+(kind==='RUN'?'run':'lift')+'</h2></section>';
  const data=kind==='RUN'?runSpecs[source]:plan(source);
  const name=kind==='RUN'?data[0]:data.name;
  const detail=kind==='RUN'?data[1]+' min planned':data.moves.length+' exercises';
  return '<section class="v6-now-card"><div class="tag">'+kind+'</div><h2>'+escapeHTML(name)+'</h2><p>'+detail+'</p><button class="primary" onclick="window.t7Open(\\''+(kind==='RUN'?'run':'lift')+'\\',\\''+currentDate+'\\')">Open session</button></section>';
 };
 return '<div class="v6-home"><h2 class="v6-page-title">Today</h2><div class="v6-lanes">'+card('LIFT',sourceLift)+card('RUN',sourceRun)+'</div><div class="v6-home-next"><button onclick="view(\\'plan\\')">View calendar →</button></div></div>';
};
})();
