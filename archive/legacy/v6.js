/* Training Log v6: single-week, two-lane schedule. Existing records are untouched. */
(()=>{
'use strict';
let offset=0;
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const mondayOf=date=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return d};
const fullWeek=()=>{const mon=mondayOf(currentDate);mon.setDate(mon.getDate()+offset*7);return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return iso(d)})};
function dayText(date){return new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
function liftRow(date){
 const p=plan(date);if(!p.moves.length)return '';
 const recorded=db.lifts.find(x=>x.date===date);
 let body=p.moves.map(m=>'<div class="v6-ex"><span>'+escapeHTML(m[0])+'</span><b>'+m[1]+' × '+m[2]+'</b></div>').join('');
 const action='<button class="v6-action" onclick="currentDate=\''+date+'\';view(\'today\');sessionEditor(\''+date+'\')">'+(recorded?'Open log':'Log session')+'</button>';
 return '<details class="v6-session"><summary><span class="v6-session-date">'+dayText(date)+'</span><span class="v6-session-name">'+escapeHTML(p.name)+'</span><span class="v6-session-meta">'+(recorded?.finished?'Done':recorded?'Started':p.moves.length+' exercises')+'</span><span class="v6-arrow">⌄</span></summary><div class="v6-session-body">'+body+action+'</div></details>';
}
function runRow(date){
 const r=runSpecs[date],recorded=db.runs.find(x=>x.date===date);if(!r&&!recorded)return '';
 const name=r?.[0]||'Unscheduled run';
 const distance=recorded?recorded.distance+' mi · '+pace(recorded.distance,recorded.minutes*60+recorded.seconds)+' /mi':r?.[1]+' min';
 const meta=recorded?'Logged':r?.[2]?.toLowerCase().includes('optional')?'Optional':'Planned';
 const actions='<button class="v6-action" onclick="currentDate=\''+date+'\';view(\'today\');runEditor(\''+date+'\')">'+(recorded?'Edit results':'Enter Garmin results')+'</button>'+(r?'<a class="v6-source" target="_blank" rel="noopener" href="https://www.tredict.com/app/training/activity/'+r[3]+'">Tredict session ↗</a>':'');
 return '<details class="v6-session"><summary><span class="v6-session-date">'+dayText(date)+'</span><span class="v6-session-name">'+escapeHTML(name)+'</span><span class="v6-session-meta">'+distance+' · '+meta+'</span><span class="v6-arrow">⌄</span></summary><div class="v6-session-body"><p>'+escapeHTML(r?.[2]||'Recorded from Garmin')+'</p>'+actions+'</div></details>';
}
function lane(title,label,content,empty){
 return '<section class="v6-lane"><div class="v6-lane-header"><span class="v6-lane-indicator">'+label+'</span><h3>'+title+'</h3></div>'+(content||'<p class="v6-empty">'+empty+'</p>')+'</section>';
}
function displayPlan(){
 const week=fullWeek();
 const begin=new Date(week[0]+'T12:00:00'),end=new Date(week[6]+'T12:00:00');
 const range=begin.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' – '+end.toLocaleDateString('en-US',{month:'short',day:'numeric'});
 const lift=week.map(liftRow).join(''),run=week.map(runRow).join('');
 return '<div class="v6-plan"><div class="v6-plan-top"><div><div class="v6-overline">TRAINING SCHEDULE</div><h2>'+range+'</h2></div><div class="v6-weekcontrols"><button aria-label="Previous week" onclick="window.v6Step(-1)">←</button><button aria-label="Current week" onclick="window.v6Now()">Today</button><button aria-label="Next week" onclick="window.v6Step(1)">→</button></div></div><div class="v6-lanes">'+lane('Strength','LIFT',lift,'No lifts scheduled.')+lane('Running','RUN',run,'No runs scheduled this week.')+'</div></div>';
}
planView=displayPlan;
window.v6Step=delta=>{offset=Math.max(-1,Math.min(11,offset+delta));render()};
window.v6Now=()=>{offset=0;render()};
const originalToday=today;
today=function(){
 const p=plan(currentDate),r=runSpecs[currentDate],loggedLift=db.lifts.find(x=>x.date===currentDate),loggedRun=db.runs.find(x=>x.date===currentDate);
 const strength='<section class="v6-now-card"><div class="v6-now-top"><span class="v6-icon">01</span><span class="v6-overline">STRENGTH</span><span class="v6-status">'+(loggedLift?.finished?'Complete':loggedLift?'In progress':p.moves.length?'Scheduled':'Rest')+'</span></div><h2>'+escapeHTML(p.name)+'</h2><div class="v6-now-sub">'+p.moves.length+' exercises</div>'+(p.moves.length?'<button class="v6-action" onclick="sessionEditor(\''+currentDate+'\')">'+(loggedLift?'Continue workout':'Start workout')+' →</button>':'')+'</section>';
 const running='<section class="v6-now-card"><div class="v6-now-top"><span class="v6-icon">02</span><span class="v6-overline">RUNNING</span><span class="v6-status">'+(loggedRun?'Logged':r?'Scheduled':'Open')+'</span></div><h2>'+escapeHTML(r?.[0]||(loggedRun?'Completed run':'No planned run'))+'</h2><div class="v6-now-sub">'+(loggedRun?loggedRun.distance+' mi · '+pace(loggedRun.distance,loggedRun.minutes*60+loggedRun.seconds)+'/mi':r?r[1]+' minutes':'Garmin results can be logged anytime')+'</div><button class="v6-action" onclick="runEditor(\''+currentDate+'\')">'+(loggedRun?'Edit run':'Log Garmin run')+' →</button></section>';
 return '<div class="v6-home"><h2 class="v6-page-title">Today</h2><div class="v6-lanes">'+strength+running+'</div><div class="v6-home-next"><span>Need the full week?</span><button onclick="view(\'plan\')">Open schedule →</button></div></div>';
};
})();

