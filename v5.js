/* Training Log v5 - plan previews, simplified logging, targeted mobility. */
(()=>{
'use strict';
const groups=[
 {id:'shoulder',title:'Shoulders',minutes:10,goal:'Overhead range and scapular control',steps:[['Wall slides',2,'8 slow reps'],['Scapular push-ups',2,'10 reps'],['Thoracic rotation',2,'6 each side'],['Band pull-aparts',2,'12 reps']]},
 {id:'back',title:'Back',minutes:10,goal:'Spinal motion and comfortable rotation',steps:[['Cat-cow',2,'8 controlled'],['Open book rotations',2,'6 each'],['Child pose reach',2,'30 sec each'],['Bird dog',2,'8 each']]},
 {id:'knees',title:'Knees',minutes:12,goal:'Comfortable controlled loading; not pain treatment',steps:[['Easy stationary cycling',1,'3 min'],['Supported split squat',2,'8 each'],['Step-down',2,'6 each'],['Wall sit',2,'20 sec']]},
 {id:'lateral',title:'Lateral hip / IT band',minutes:12,goal:'Hip strength and lateral control; avoid aggressive IT band stretching',steps:[['Side-lying hip raise',2,'12 each'],['Lateral band walks',2,'10 steps each'],['Single-leg bridge',2,'8 each'],['Standing hip airplane support',2,'5 each']]},
 {id:'chest',title:'Chest',minutes:10,goal:'Pectoral range, upper-back control',steps:[['Doorway pec stretch',2,'30 sec each'],['Wall slides',2,'8 reps'],['Thoracic rotation',2,'6 each'],['Scapular push-ups',2,'10 reps']]},
 {id:'run',title:'Running durability',minutes:12,goal:'Lower-leg strength and single-leg control',steps:[['Straight-knee calf raise',2,'12 reps'],['Bent-knee calf raise',2,'12 reps'],['Tibialis raise',2,'12 reps'],['Single-leg balance',2,'30 sec each']]},
 {id:'hip',title:'Hips / ankles',minutes:12,goal:'Squatting range and ankle mobility',steps:[['90/90 hip transitions',2,'6 each'],['Ankle rocks',2,'10 each'],['Supported split squat hold',2,'20 sec each'],['Hip circles',2,'5 each']]},
 {id:'recovery',title:'Full-body recovery',minutes:10,goal:'Easy motion after training',steps:[['Walk',1,'3 min'],['Cat-cow',1,'8 reps'],['Child pose reach',2,'30 sec'],['90/90 hip transitions',1,'8 reps']]}
];
mobilityPrograms.splice(0,mobilityPrograms.length,...groups);
function preview(date){
 const p=plan(date),r=runSpecs[date];
 const lift=p.moves.length?'<details class="t5-preview"><summary><strong>'+escapeHTML(p.name)+'</strong><span>'+p.moves.length+' movements <b>⌄</b></span></summary><div class="t5-inside">'+p.moves.map(m=>'<div class="t5-line"><span>'+escapeHTML(m[0])+'</span><span>'+m[1]+' × '+m[2]+'</span></div>').join('')+'<button class="primary" onclick="currentDate=\''+date+'\';view(\'today\');sessionEditor(\''+date+'\')">Log workout</button></div></details>':'';
 const run=r?'<details class="t5-preview"><summary><strong>'+escapeHTML(r[0])+'</strong><span>'+r[1]+' min <b>⌄</b></span></summary><div class="t5-inside"><p>'+escapeHTML(r[2])+'</p><button onclick="runEditor(\''+date+'\')">Log run</button> <a href="https://www.tredict.com/app/training/activity/'+r[3]+'" target="_blank" rel="noopener">Tredict plan</a></div></details>':'';
 return lift+run;
}
planView=function(){
 const now=new Date(currentDate+'T12:00:00'),monday=new Date(now);
 monday.setDate(now.getDate()-((now.getDay()+6)%7));
 let h='<div class="t5-head"><h2>Training schedule</h2><span>Tap a day to expand</span></div>';
 for(let week=0;week<8;week++){
  const mondayDate=new Date(monday);mondayDate.setDate(monday.getDate()+7*week);
  let days='';for(let i=0;i<7;i++){const dt=new Date(mondayDate);dt.setDate(mondayDate.getDate()+i);const date=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');const p=plan(date),r=runSpecs[date];const scheduled=p.moves.length||r;if(!scheduled)continue;days+='<details class="t5-day"><summary><div class="t5-daylabel"><strong>'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]+'</strong><small>'+date.slice(5)+'</small></div><div class="t5-dayname">'+(p.moves.length?'<div>'+escapeHTML(p.name)+'</div>':'')+(r?'<div class="t5-runname">'+escapeHTML(r[0])+'</div>':'')+'</div><span class="t5-chevron">⌄</span></summary><div class="t5-daybody">'+preview(date)+'</div></details>';}
  if(week===0)h+='<div class="t5-week"><div class="t5-weektitle">This week</div>'+days+'</div>';
  else h+='<details class="t5-week"><summary>Week starting '+dateShort(mondayDate.getFullYear()+'-'+String(mondayDate.getMonth()+1).padStart(2,'0')+'-'+String(mondayDate.getDate()).padStart(2,'0'))+' <span>⌄</span></summary>'+days+'</details>';
 }
 return h;
};
const beforeSession=sessionEditor;
sessionEditor=function(date){
 beforeSession(date);
 const panel=document.querySelector('#main .card');if(!panel)return;
 panel.querySelectorAll('.exercise').forEach((section,i)=>{
   section.querySelectorAll('.sets [data-k="rir"]').forEach(e=>e.style.display='none');
   section.querySelectorAll('.sets').forEach(row=>{
     row.style.gridTemplateColumns='22px minmax(0,1fr) minmax(0,1fr) 40px';
     const input=row.querySelector('[data-k="rir"]');if(input)input.remove();
     Array.from(row.children).forEach(child=>{if(child.textContent.trim()==='RIR')child.remove()});
   });
   const first=section.querySelector('.row');
   if(first){const badge=first.querySelector('.pill');if(badge)badge.remove();}
   const details=section.querySelector('.tlg-details');
   if(details)details.querySelectorAll('.tlg-media,.tlg-photo-wrap').forEach(el=>el.remove());
 });
 const note=panel.querySelector('#lift-save-status');if(note)note.textContent='Saved locally';
};
const beforeMobility=openMobility;
openMobility=function(id){
 beforeMobility(id);
 const panel=document.querySelector('#main .card');if(!panel)return;
 panel.querySelectorAll('.tlg-photo-wrap,.tlg-media').forEach(x=>x.remove());
 const oldIntro=panel.querySelector('p');if(oldIntro)oldIntro.remove();
};
mobility=function(){
 const completed=db.mobility||[];
 return '<div class="t5-mobility">'+groups.map(g=>'<div class="t5-mobcard"><div><strong>'+g.title+'</strong><small>'+g.minutes+' min · '+g.steps.length+' movements'+(completedMobility(currentDate,g.id)?' · Done':'')+'</small></div><button onclick="openMobility(\''+g.id+'\')">Open</button></div>').join('')+'</div>';
};
const beforeProgress=progress;
progress=function(){
 const core=window.trainingCore;const strength=core?.liftSummary(db.lifts),run=core?.runSummary(db.runs);
 const items=[['Lifts',strength?.sessions??db.lifts.filter(x=>x.finished).length],['Sets',strength?.sets??0],['Runs',run?.sessions??db.runs.length],['Miles',run?.miles?.toFixed(1)??'0.0']];
 let h='<div class="t5-statgrid">'+items.map(x=>'<div class="t5-stat"><strong>'+x[1]+'</strong><span>'+x[0]+'</span></div>').join('')+'</div>';
 const lifts=db.lifts.filter(x=>x.finished).sort((a,b)=>b.date.localeCompare(a.date));
 const runs=db.runs.slice().sort((a,b)=>b.date.localeCompare(a.date));
 if(lifts.length)h+='<section class="card"><h2>Recent lifting</h2>'+lifts.slice(0,6).map(x=>'<div class="t5-line"><span>'+dateShort(x.date)+' · '+escapeHTML(x.session)+'</span><strong>'+x.exercises.flatMap(e=>e.sets.filter(s=>s.done)).length+' sets</strong></div>').join('')+'</section>';
 if(runs.length)h+='<section class="card"><h2>Recent runs</h2>'+runs.slice(0,8).map(x=>'<div class="t5-line"><span>'+dateShort(x.date)+'</span><strong>'+x.distance+' mi · '+pace(x.distance,x.minutes*60+x.seconds)+'</strong></div>').join('')+'</section>';
 if(!lifts.length&&!runs.length)h+='<p class="t5-empty">Completed workouts and runs will appear here.</p>';
 return h;
};
})();
