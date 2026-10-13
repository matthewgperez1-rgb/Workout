import {sessions,runSpecs} from './program.mjs';
const KEY='rangeboard_v2',TZ='America/New_York';
const fmt=n=>String(n).padStart(2,'0');
function eastern(){const p=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=t=>p.find(x=>x.type===t).value;return get('year')+'-'+get('month')+'-'+get('day')}
function plus(date,days){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return d.getFullYear()+'-'+fmt(d.getMonth()+1)+'-'+fmt(d.getDate())}
function weekday(date){return new Date(date+'T12:00:00').getDay()}
function pretty(date,opts={weekday:'short',month:'short',day:'numeric'}){return new Date(date+'T12:00:00').toLocaleDateString('en-US',opts)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function uid(){return globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random()}
const fresh=()=>({schema:2,lifts:[],runs:[],measurements:[],mobility:[],moves:{lift:{},run:{}},overrides:{},notes:{}});
let data=fresh();try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.schema===2&&Array.isArray(saved.lifts)&&Array.isArray(saved.runs))data={...data,...saved}}catch{}
data.moves={lift:{},run:{},...data.moves};data.mobility??=[];data.overrides??={};
function save(){data.updated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{alert('Storage is full or unavailable. Export your records before leaving.');return false}}
const app=document.querySelector('#app');
let page='today',selected=eastern(),weekShift=0,detail=null,activeLift=null,activeMobility=null,interval=null,timerUntil=0,timerRemaining=60,timerPreset=60;
const icons={
 today:'<path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 lift:'<path d="m6 7 11 10M5 10l5-5M14 19l5-5M3 8l5-5M16 21l5-5"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l4 2"/>',
 progress:'<path d="M3 20h18M5 16l5-6 4 3 5-8"/>',
 mobility:'<circle cx="12" cy="4" r="2"/><path d="M4 11l8-3 8 3M12 8v8M6 21l6-5 6 5"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>'
};
function icon(id){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+icons[id]+'</svg>'}
const nav=[['today','Today','today'],['calendar','Plan','calendar'],['history','History','history'],['progress','Progress','progress'],['mobility','Mobility','mobility'],['settings','Settings','settings']];
function chrome(body){app.innerHTML='<div class="shell"><header class="top"><div class="brand"><div class="mark">↗</div><span>TRAINING LOG</span></div><div class="top-time" id="nowTime"></div></header><main class="main" id="main">'+body+'</main><nav class="bottom">'+nav.map(([id,label,symbol])=>'<button data-page="'+id+'" class="'+(page===id?'active':'')+'" aria-label="'+label+'">'+icon(symbol)+'<span>'+label+'</span></button>').join('')+'</nav></div>';document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));clock()}
function clock(){const n=document.getElementById('nowTime');if(n)n.textContent=new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'numeric',minute:'2-digit'}).format(new Date())}
setInterval(clock,30000);
function go(next){page=next;detail=null;activeLift=null;activeMobility=null;render();scrollTo(0,0)}
function startOfWeek(date){return plus(date,-((weekday(date)+6)%7))}
function getPlan(source){return data.overrides[source]||sessions[weekday(source)]||sessions[0]}
function sourceAt(kind,date){
 const mapping=data.moves[kind];
 const moved=Object.keys(mapping).find(k=>mapping[k]===date);
 if(moved)return moved;
 if(mapping[date])return null;
 if(kind==='run')return runSpecs[date]?date:null;
 return getPlan(date).moves.length?date:null
}
function planned(kind,date){const source=sourceAt(kind,date);return source?{kind,date,source,info:kind==='run'?runSpecs[source]:getPlan(source)}:null}
function result(kind,date){return kind==='run'?data.runs.find(x=>x.date===date):data.lifts.find(x=>x.date===date)}
function runPace(d,t){const v=Math.round(t/d);return d>0&&t>0?Math.floor(v/60)+':'+fmt(v%60):'—'}
function status(kind,date){const log=result(kind,date);return kind==='lift'?(log?.finished?'Completed':log?'In progress':'Planned'):(log?'Recorded':'Planned')}
function runDescription(p){const log=result('run',p.date);return log?log.distance+' mi · '+runPace(log.distance,log.minutes*60+log.seconds)+'/mi':p.info[1]+' min planned'}
function todayPage(){
 const a=planned('lift',selected),b=planned('run',selected);
 const lift=a?'<div class="stage"><div class="stage-label">STRENGTH · '+status('lift',selected).toUpperCase()+'</div><h2>'+esc(a.info.name)+'</h2><p>'+a.info.moves.length+' movements · Strength & athleticism</p><button class="accent" data-open="lift">Open workout ↗</button></div>':'<div class="stage"><div class="stage-label">STRENGTH</div><h2>Recovery day</h2><p>No lift scheduled.</p></div>';
 const run=b?'<div class="run-card"><div class="run-badge">↗</div><div><div class="eyebrow">RUN · '+status('run',selected)+'</div><h3>'+esc(b.info[0])+'</h3><p>'+runDescription(b)+'</p><div class="actions"><button class="ghost small" data-open="run">View session →</button></div></div></div>':'<div class="run-card"><div class="run-badge">↗</div><div><div class="eyebrow">RUN</div><h3>No scheduled run</h3><p>Garmin results can still be entered.</p><div class="actions"><button class="ghost small" data-free-run>Log run</button></div></div></div>';
 const start=startOfWeek(selected);
 const strip=Array.from({length:7},(_,i)=>{const date=plus(start,i),l=planned('lift',date),r=planned('run',date);return '<button class="daychip '+(date===selected?'active':'')+'" data-date="'+date+'"><small>'+pretty(date,{weekday:'short'}).toUpperCase()+'</small><strong>'+date.slice(-2)+'</strong><span class="dotset">'+(l?'<i class="dot"></i>':'')+(r?'<i class="dot run"></i>':'')+'</span></button>'}).join('');
 chrome('<div class="view-head"><div class="eyebrow">'+pretty(selected,{weekday:'long',month:'long',day:'numeric'})+'</div><h1 class="title">Your training.</h1></div><div class="today-stack">'+lift+run+'</div><h3 class="section-title">This week</h3><div class="weekstrip">'+strip+'</div>');
 document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.date;render()});
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>b.dataset.open==='lift'?editLift(selected,planned('lift',selected)):openSession('run',selected));
 const free=document.querySelector('[data-free-run]');if(free)free.onclick=()=>editRun(selected,null)
}
function calendarPage(){
 const start=plus(startOfWeek(selected),7*weekShift);
 const strip=Array.from({length:7},(_,i)=>{const d=plus(start,i);return {date:d,lift:planned('lift',d),run:planned('run',d)}});
 const body=strip.map(x=>{
 const renderSession=(item)=>{if(!item)return '';const run=item.kind==='run',title=run?item.info[0]:item.info.name,sub=run?runDescription(item):item.info.moves.length+' exercises';return '<button class="session '+(run?'run':'')+'" data-kind="'+item.kind+'" data-date="'+x.date+'"><div class="session-content"><div class="session-kind">'+(run?'RUN':'STRENGTH')+' · '+status(item.kind,x.date).toUpperCase()+'</div><h4>'+esc(title)+'</h4><p>'+esc(sub)+'</p></div><span class="arrow">›</span></button>'};
 return '<div class="timeline-day"><div class="timeline-date">'+pretty(x.date,{weekday:'short'}).toUpperCase()+'<strong>'+x.date.slice(-2)+'</strong></div><div class="timeline-entries">'+(renderSession(x.lift)+renderSession(x.run)||'<div class="empty-day">Recovery / available</div>')+'</div></div>'
 }).join('');
 chrome('<div class="view-head"><div class="eyebrow">YOUR PLAN</div><h1 class="title">Training calendar.</h1></div><div class="calendar-nav"><h2>'+pretty(start,{month:'short',day:'numeric'})+' – '+pretty(plus(start,6),{month:'short',day:'numeric'})+'</h2><div class="navbuttons"><button data-prev aria-label="Previous week">←</button><button data-now>Today</button><button data-next aria-label="Next week">→</button></div></div><div class="timeline">'+body+'</div>');
 document.querySelector('[data-prev]').onclick=()=>{weekShift--;render()};
 document.querySelector('[data-next]').onclick=()=>{weekShift++;render()};
 document.querySelector('[data-now]').onclick=()=>{weekShift=0;selected=eastern();render()};
 document.querySelectorAll('.session').forEach(b=>b.onclick=()=>openSession(b.dataset.kind,b.dataset.date))
}
function openSession(kind,date){
 const p=planned(kind,date);if(!p){if(kind==='run')return editRun(date,null);return}
 detail={kind,date,source:p.source};page='calendar';
 const title=kind==='run'?p.info[0]:p.info.name;
 const list=kind==='run'?'<p class="subtitle">'+p.info[1]+' minutes · '+esc(p.info[2])+'</p>':p.info.moves.map(m=>'<div class="exercise-line"><span>'+esc(m[0])+'</span><span>'+m[1]+' × '+m[2]+'</span></div>').join('');
 const original=p.source!==date?'<p class="note">Originally scheduled '+pretty(p.source)+'</p>':'';
 const tredict=kind==='run'?'<a class="link" target="_blank" rel="noopener" href="https://www.tredict.com/app/training/activity/'+p.info[3]+'">Open original Tredict plan ↗</a>':'';
 chrome('<button class="ghost small" id="back">← Calendar</button><div class="detail"><div class="eyebrow">'+(kind==='run'?'RUNNING':'STRENGTH')+'</div><h2>'+esc(title)+'</h2>'+original+list+'<div class="actions"><button class="solid" id="record">'+(kind==='run'?'Enter Garmin results':'Start / open lifting log')+'</button><button class="ghost" id="move">Move workout</button></div><div style="margin-top:14px">'+tredict+'</div></div>');
 document.getElementById('back').onclick=()=>{detail=null;render()};
 document.getElementById('record').onclick=()=>kind==='run'?editRun(date,p):editLift(date,p);
 document.getElementById('move').onclick=()=>moveScreen(p)
}
function moveScreen(p){
 const kind=p.kind;const options=Array.from({length:15},(_,i)=>plus(p.source,i-7));
 const logged=data[kind==='run'?'runs':'lifts'].some(l=>l.date===p.date);
 if(logged){alert('Recorded sessions cannot be moved.');return}
 let html='<button class="ghost small" id="cancel">← Back</button><div class="view-head"><div class="eyebrow">SCHEDULE</div><h1 class="title">Move workout.</h1><p class="subtitle">The original Tredict plan will not change.</p></div><div class="choice-grid">';
 for(const date of options){const occupied=sourceAt(kind,date);const blocked=occupied&&occupied!==p.source;html+='<button class="choice" data-target="'+date+'" '+(blocked?'disabled':'')+'><b>'+pretty(date)+'</b><small>'+(blocked?'Session already here':date===p.date?'Current day':'Move here')+'</small></button>'}
 html+='</div>';chrome(html);
 document.getElementById('cancel').onclick=()=>openSession(kind,p.date);
 document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>moveWorkout(p,b.dataset.target))
}
function moveWorkout(p,target){
 if(sourceAt(p.kind,target)&&sourceAt(p.kind,target)!==p.source)return;
 if(p.kind==='lift'&&data.lifts.some(l=>l.date===p.date))return alert('Started workouts cannot be moved.');
 if(p.kind==='run'&&data.runs.some(l=>l.date===p.date))return alert('Recorded runs cannot be moved.');
 const mapping=data.moves[p.kind],old=mapping[p.source];if(p.kind==='lift'&&old)delete data.overrides[old];
 if(target===p.source)delete mapping[p.source];else {mapping[p.source]=target;if(p.kind==='lift')data.overrides[target]=getPlan(p.source)}
 save();weekShift=0;detail=null;selected=target;render()
}
const warmups={
 1:[['Easy cardio','3 minutes'],['Scapular push-ups','10 reps'],['Light ramp-up sets','2 sets']],
 2:[['Easy bike','3 minutes'],['Ankle rocks','10 each'],['Light squats','2 sets']],
 4:[['Easy cardio','3 minutes'],['Band rows','12 reps'],['Light ramp-up sets','2 sets']],
 5:[['Easy walk','3 minutes'],['Glute bridges','10 reps'],['Light hinge','2 sets']]
};
const cooldowns=[['Easy walk','2 minutes'],['Gentle mobility','3–5 minutes']];
function priorSet(name,date){return data.lifts.filter(x=>x.date<date&&x.finished).sort((a,b)=>b.date.localeCompare(a.date)).flatMap(x=>x.exercises.filter(e=>e.name===name).flatMap(e=>e.sets.filter(s=>s.done)))[0]}
function editLift(date,p){
 selected=date;page='lift';
 let log=data.lifts.find(l=>l.date===date);
 if(!log){const workout=p?.info||getPlan(date);log={id:uid(),date,session:workout.name,created:new Date().toISOString(),exercises:workout.moves.map(m=>({name:m[0],category:m[5],tip:m[4],sets:Array.from({length:m[1]},()=>({weight:priorSet(m[0],date)?.weight??0,reps:m[2],done:false}))})),stages:{warmup:[],cooldown:[]},finished:false};data.lifts.push(log);save()}
 log.stages??={warmup:[],cooldown:[]};activeLift=log.id;render()
}
function currentLog(){return data.lifts.find(l=>l.id===activeLift)}
function stageHTML(log,type,moves){
 const checked=log.stages?.[type]||[];
 return '<details class="flow-panel"><summary>'+(type==='warmup'?'Warm-up':'Cooldown')+' <span style="float:right;color:#91a091;font-size:11px">Optional</span></summary>'+moves.map(([title,dose],i)=>'<label class="flow-item"><input type="checkbox" data-stage="'+type+'" data-index="'+i+'" '+(checked.includes(i)?'checked':'')+'><span>'+esc(title)+'<small>'+dose+'</small></span></label>').join('')+'</details>'
}
function timerHTML(){return '<div class="timer"><div class="timer-top"><div><div class="stage-label">REST TIMER</div><strong id="timer-value">'+timerText()+'</strong></div><button class="timer-toggle" id="timer-toggle">'+(timerUntil?'Pause':'Start')+'</button></div><div class="presets">'+[60,90,120].map(n=>'<button class="'+(timerPreset===n?'sel':'')+'" data-timer="'+n+'">'+(n===120?'2 min':n+' sec')+'</button>').join('')+'<button id="timer-reset">Reset</button></div></div>'}
function timerText(){const secs=timerUntil?Math.max(0,Math.ceil((timerUntil-Date.now())/1000)):timerRemaining;return Math.floor(secs/60)+':'+fmt(secs%60)}
function timerTick(){if(timerUntil&&Date.now()>=timerUntil){timerUntil=0;timerRemaining=0;if(navigator.vibrate)navigator.vibrate(150)}const n=document.getElementById('timer-value');if(n)n.textContent=timerText();const t=document.getElementById('timer-toggle');if(t)t.textContent=timerUntil?'Pause':timerRemaining===0?'Restart':'Start'}
if(!interval)interval=setInterval(timerTick,250);
function liftPage(){
 const log=currentLog();if(!log){go('today');return}
 const phase=Math.max(1,Math.floor((Date.parse(log.date+'T12:00:00')-Date.parse('2026-10-12T12:00:00'))/604800000)+1);
 const sections=log.exercises.map((e,i)=>'<article class="exercise-box"><h3>'+esc(e.name)+'</h3><p>'+esc(priorSet(e.name,log.date)?'Previous: '+priorSet(e.name,log.date).weight+' lb × '+priorSet(e.name,log.date).reps:'')+'</p><div class="set-head"><span>#</span><span>WEIGHT (LB)</span><span>REPS / SEC</span><span>✓</span></div>'+e.sets.map((s,j)=>'<div class="set-row"><span>'+(j+1)+'</span><input type="number" min="0" step=".5" data-e="'+i+'" data-s="'+j+'" data-field="weight" value="'+(+s.weight||0)+'" aria-label="'+esc(e.name)+' set '+(j+1)+' weight"><input type="number" min="0" data-e="'+i+'" data-s="'+j+'" data-field="reps" value="'+(+s.reps||0)+'" aria-label="'+esc(e.name)+' set '+(j+1)+' reps"><input type="checkbox" data-e="'+i+'" data-s="'+j+'" data-field="done" '+(s.done?'checked':'')+' aria-label="'+esc(e.name)+' set '+(j+1)+' complete"></div>').join('')+'<details><summary>Options & technique</summary><p class="note">'+esc(e.tip||'Controlled movement')+'</p>'+photoControl(e.name)+'<div class="mini-actions"><button data-add="'+i+'">Add set</button><button data-remove="'+i+'">Remove set</button><button data-replace="'+i+'">Replace exercise</button></div></details></article>').join('');
 const day=weekday(log.date);
 const done=log.exercises.flatMap(e=>e.sets).filter(s=>s.done).length;
 chrome('<div class="lift-header"><button class="ghost small" id="exit-lift">← Today</button><div class="eyebrow" style="margin-top:14px">WEEK '+phase+' · '+done+' COMPLETED SETS</div><h1>'+esc(log.session)+'</h1><p class="lift-sub">'+pretty(log.date)+' · Changes save as you train</p></div>'+timerHTML()+stageHTML(log,'warmup',warmups[day]||[['Easy warm-up','3 minutes'],['Ramp-up sets','2 sets']])+sections+stageHTML(log,'cooldown',cooldowns)+'<div class="field"><label>Notes</label><textarea rows="2" id="lift-notes" class="textfield" placeholder="Optional">'+esc(log.notes||'')+'</textarea></div><div class="actions"><button class="ghost" id="save-lift">Save draft</button><button class="solid" id="complete-lift">'+(log.finished?'Finished ✓':'Finish workout')+'</button></div>');
 attachPhotoControls();document.getElementById('exit-lift').onclick=()=>go('today');
 document.getElementById('timer-toggle').onclick=()=>{if(timerUntil){timerRemaining=Math.ceil((timerUntil-Date.now())/1000);timerUntil=0}else{if(timerRemaining===0)timerRemaining=timerPreset;timerUntil=Date.now()+timerRemaining*1000}timerTick()};
 document.querySelectorAll('[data-timer]').forEach(b=>b.onclick=()=>{timerPreset=Number(b.dataset.timer);timerRemaining=timerPreset;timerUntil=0;render()});
 document.getElementById('timer-reset').onclick=()=>{timerUntil=0;timerRemaining=timerPreset;timerTick()};
 document.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',()=>{const s=log.exercises[+input.dataset.e].sets[+input.dataset.s];s[input.dataset.field]=input.type==='checkbox'?input.checked:Math.max(0,Number(input.value));save()}));
 document.querySelectorAll('[data-stage]').forEach(input=>input.onchange=()=>{const a=log.stages[input.dataset.stage]||[];const i=Number(input.dataset.index);log.stages[input.dataset.stage]=input.checked?[...new Set([...a,i])]:a.filter(x=>x!==i);save()});
 document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const e=log.exercises[+b.dataset.add],last=e.sets.at(-1);e.sets.push({...last,done:false});save();render()});
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const e=log.exercises[+b.dataset.remove];if(e.sets.length>1){if(e.sets.at(-1).done&&!confirm('Remove a completed set?'))return;e.sets.pop();save();render()}});
 document.querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>{const e=log.exercises[+b.dataset.replace],s=prompt('Replacement exercise',e.name);if(s?.trim()){e.name=s.trim().slice(0,80);save();render()}});
 document.getElementById('lift-notes').onchange=e=>{log.notes=e.target.value;save()};
 document.getElementById('save-lift').onclick=()=>go('today');
 document.getElementById('complete-lift').onclick=()=>{if(!log.exercises.some(e=>e.sets.some(s=>s.done)))return alert('Mark at least one completed set.');log.finished=true;save();go('today')}
}
const mobility=[
 ['Shoulders',10,[['Wall slides','2 × 8'],['Scapular push-ups','2 × 10'],['Thoracic rotation','2 × 6 each'],['Band pull-aparts','2 × 12']]],
 ['Back',10,[['Cat-cow','2 × 8'],['Open-book rotation','2 × 6 each'],['Bird dog','2 × 8 each']]],
 ['Knees',12,[['Easy bike','3 min'],['Supported split squat','2 × 8 each'],['Controlled step-down','2 × 6 each'],['Wall sit','2 × 20 sec']]],
 ['Lateral hips',12,[['Band lateral walk','2 × 10 each'],['Side-lying leg raise','2 × 12'],['Single-leg bridge','2 × 8 each']]],
 ['Chest',10,[['Doorway stretch','2 × 30 sec'],['Wall slide','2 × 8'],['Thoracic rotation','2 × 6 each']]],
 ['Running durability',12,[['Straight-knee calf raise','2 × 12'],['Bent-knee calf raise','2 × 12'],['Tibialis raise','2 × 12'],['Single-leg balance','2 × 30 sec']]],
 ['Hips / ankles',12,[['90/90 transitions','2 × 6 each'],['Knee-to-wall ankle rocks','2 × 10 each'],['Split-squat hold','2 × 20 sec']]],
 ['Recovery flow',10,[['Easy walk','3 min'],['Cat-cow','8 reps'],['Gentle hip mobility','3 min']]],['Core stability',12,[['Dead bug','3 × 8 each'],['Side plank','2 × 30 sec each'],['Bird dog','2 × 8 each'],['Pallof press','2 × 10 each']]]
];
const photoMap={'Straight-knee calf raise':'Standing_Calf_Raises','Bent-knee calf raise':'Seated_Calf_Raise','Dead bug':'Dead_Bug','Side plank':'Side_Plank','Bird dog':'Bird_Dog','DB bench press':'Dumbbell_Bench_Press','Romanian deadlift':'Romanian_Deadlift_With_Dumbbells','Hammer curl':'Hammer_Curls','Scapular push-ups':'Scapular_Push-Up','Doorway stretch':'Doorway_Stretch','Hip flexor stretch':'Kneeling_Hip_Flexor'};
let exerciseCatalog=null;
async function showReference(button){
 const place=button.nextElementSibling;
 if(place.dataset.open==='yes'){place.replaceChildren();place.dataset.open='no';return}
 place.textContent='Loading reference…';
 try{
  exerciseCatalog ||=fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json').then(r=>{if(!r.ok)throw Error('Unavailable');return r.json()}).catch(e=>{exerciseCatalog=null;throw e});
  const all=await exerciseCatalog,name=button.dataset.exercise,alias=photoMap[name]||name;
  const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
  const ex=all.find(x=>norm(x.id)===norm(alias)||norm(x.name)===norm(alias));
  place.replaceChildren();
  if(ex?.images?.length){
   const img=document.createElement('img');img.className='exercise-photo';img.loading='lazy';img.alt='Reference for '+ex.name;
   img.src='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'+ex.images[0].split('/').map(encodeURIComponent).join('/');
   img.onerror=()=>{place.textContent='Reference image unavailable.'};
   const credit=document.createElement('small');credit.textContent='Free Exercise DB · '+ex.name+' (check variation)';
   place.append(img,credit);
  }else{
   const a=document.createElement('a');a.href='https://www.youtube.com/results?search_query='+encodeURIComponent(name+' exercise demonstration');a.target='_blank';a.rel='noopener noreferrer';a.textContent='Find movement demonstration ↗';place.append(a);
  }
  place.dataset.open='yes';
 }catch{place.textContent='References require an internet connection.'}
}
const photoControl=name=>'<div class="photo-control"><button type="button" class="photo-button" data-exercise="'+esc(name)+'">View demonstration</button><div class="photo-result"></div></div>';
function attachPhotoControls(){document.querySelectorAll('[data-exercise]').forEach(b=>b.onclick=()=>showReference(b))}
function mobilityPage(){chrome('<div class="view-head"><div class="eyebrow">OPTIONAL SESSIONS</div><h1 class="title">Move better.</h1><p class="subtitle">Separate from strength and running.</p></div><div class="mobility-grid">'+mobility.map(([name,duration],i)=>'<button class="mobility-card" data-mob="'+i+'"><i>'+['◉','≋','⌁','↔','◌','▰','⟡','☼','⊕'][i]+'</i><div><b>'+name+'</b><span>'+duration+' min</span></div></button>').join('')+'</div>');document.querySelectorAll('[data-mob]').forEach(b=>b.onclick=()=>{page='routine';activeMobility=+b.dataset.mob;render()})}
function routinePage(){const m=mobility[activeMobility],date=selected,existing=data.mobility.find(x=>x.date===date&&x.program===m[0]);if(!m){go('mobility');return}
 chrome('<button id="backmob" class="ghost small">← Mobility</button><div class="view-head"><div class="eyebrow">MOBILITY · '+m[1]+' MIN</div><h1 class="title">'+m[0]+'</h1></div><div class="info-panel">'+m[2].map(([name,dose],i)=>'<label class="flow-item"><input type="checkbox" data-mstep="'+i+'" '+(existing?.checks?.includes(i)?'checked':'')+'><span>'+esc(name)+'<small>'+dose+'</small></span></label>'+photoControl(name)).join('')+'</div><button class="solid" id="savemob">Save routine</button>');
 attachPhotoControls();document.getElementById('backmob').onclick=()=>go('mobility');
 document.getElementById('savemob').onclick=()=>{const checks=[...document.querySelectorAll('[data-mstep]:checked')].map(x=>+x.dataset.mstep);const item={id:date+'|'+m[0],date,program:m[0],checks,completed:checks.length===m[2].length,updated:new Date().toISOString()};const at=data.mobility.findIndex(x=>x.id===item.id);if(at>=0)data.mobility[at]=item;else data.mobility.push(item);save();go('mobility')}
}
function editRun(date,p){
 page='run';selected=date;const old=data.runs.find(x=>x.date===date);const info=p?.info||planned('run',date)?.info;
 chrome('<button id="runback" class="ghost small">← Today</button><div class="view-head"><div class="eyebrow">GARMIN · MANUAL ENTRY</div><h1 class="title">'+esc(info?.[0]||'Record a run')+'</h1></div><div class="info-panel"><div class="field"><label>Date</label><input id="r-date" type="date" class="textfield" value="'+date+'"></div><div class="formgrid"><div class="field"><label>Miles</label><input id="r-distance" class="textfield" type="number" min="0" step=".01" value="'+(old?.distance??'')+'"></div><div class="field"><label>Minutes</label><input id="r-minutes" class="textfield" type="number" min="0" value="'+(old?.minutes??'')+'"></div><div class="field"><label>Seconds</label><input id="r-seconds" class="textfield" type="number" min="0" max="59" value="'+(old?.seconds??'0')+'"></div><div class="field"><label>Effort 1–10</label><input id="r-effort" class="textfield" type="number" min="1" max="10" value="'+(old?.effort??4)+'"></div><div class="field"><label>Avg heart rate (optional)</label><input id="r-hr" class="textfield" type="number" min="0" value="'+(old?.avgHR??'')+'"></div><div class="field"><label>Cadence (optional)</label><input id="r-cad" class="textfield" type="number" min="0" value="'+(old?.cadence??'')+'"></div></div><div class="field"><label>Notes</label><textarea class="textfield" rows="2" id="r-notes">'+esc(old?.notes||'')+'</textarea></div><div class="actions"><button class="solid" id="submit-run">Save run</button></div></div>');
 document.getElementById('runback').onclick=()=>go('today');
 document.getElementById('submit-run').onclick=()=>{const distance=Number(document.getElementById('r-distance').value),minutes=Number(document.getElementById('r-minutes').value),seconds=Number(document.getElementById('r-seconds').value),effort=Number(document.getElementById('r-effort').value),newDate=document.getElementById('r-date').value;if(!(distance>0&&Number.isInteger(minutes)&&minutes>=0&&Number.isInteger(seconds)&&seconds>=0&&seconds<60&&(minutes*60+seconds)>0&&effort>=1&&effort<=10&&newDate))return alert('Check distance, elapsed time, and effort.');if(data.runs.some(x=>x.date===newDate&&x.id!==old?.id))return alert('A run is already recorded for that date.');const item={id:old?.id||uid(),date:newDate,distance,minutes,seconds,effort,avgHR:Number(document.getElementById('r-hr').value)||null,cadence:Number(document.getElementById('r-cad').value)||null,notes:document.getElementById('r-notes').value,source:'garmin-manual',updated:new Date().toISOString()};const at=data.runs.findIndex(x=>x.id===item.id);if(at>=0)data.runs[at]=item;else data.runs.push(item);save();selected=newDate;go('today')}
}
function historyPage(){
 const entries=[...data.lifts.map(x=>({date:x.date,title:x.session,type:x.finished?'Strength':'Draft',detail:x.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0)+' completed sets'})),...data.runs.map(x=>({date:x.date,title:'Run',type:'Running',detail:x.distance+' mi · '+runPace(x.distance,x.minutes*60+x.seconds)+'/mi'})),...data.mobility.filter(x=>x.completed).map(x=>({date:x.date,title:x.program,type:'Mobility',detail:'Completed'}))].sort((a,b)=>b.date.localeCompare(a.date));
 chrome('<div class="view-head"><div class="eyebrow">ACTIVITY</div><h1 class="title">Training history.</h1></div><div class="info-panel">'+(entries.length?entries.map(x=>'<div class="history-row"><div><b>'+esc(x.title)+'</b><small>'+pretty(x.date)+' · '+x.type+'</small></div><span>'+esc(x.detail)+'</span></div>').join(''):'<p>No sessions recorded yet.</p>')+'</div>')
}
function progressPage(){
 const completed=data.lifts.filter(x=>x.finished),runs=data.runs,miles=runs.reduce((a,x)=>a+Number(x.distance||0),0),sets=completed.reduce((a,x)=>a+x.exercises.flatMap(e=>e.sets.filter(s=>s.done)).length,0);
 const stats=[['Lift sessions',completed.length],['Working sets',sets],['Runs',runs.length],['Miles',miles.toFixed(1)]];
 chrome('<div class="view-head"><div class="eyebrow">PROGRESSION</div><h1 class="title">The numbers.</h1></div><div class="metric-grid">'+stats.map(([k,v])=>'<div class="metric-card"><strong>'+v+'</strong><span>'+k+'</span></div>').join('')+'</div><div class="info-panel"><h3>Strength progression</h3>'+(completed.length?completed.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(l=>'<div class="history-row"><span>'+pretty(l.date)+' · '+esc(l.session)+'</span><b>'+l.exercises.flatMap(e=>e.sets.filter(s=>s.done)).length+' sets</b></div>').join(''):'<p>Complete your first lifting session to see progress.</p>')+'</div><div class="info-panel"><h3>Running progression</h3>'+(runs.length?runs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(r=>'<div class="history-row"><span>'+pretty(r.date)+' · '+r.distance+' mi</span><b>'+runPace(r.distance,r.minutes*60+r.seconds)+'/mi</b></div>').join(''):'<p>Enter Garmin runs to track pace and mileage.</p>')+'</div>')
}
function settingsPage(){
 const backup=localStorage.getItem('training_repo')||'';
 chrome('<div class="view-head"><div class="eyebrow">DATA & BACKUP</div><h1 class="title">Settings.</h1></div><div class="info-panel"><h3>Workout records</h3><p>Saved immediately on this device. Export a backup regularly.</p><div class="actions"><button class="solid" id="export">Export JSON</button><button class="ghost" id="import">Import JSON</button><input style="display:none" type="file" id="jsonfile" accept=".json,application/json"></div></div><div class="info-panel"><h3>GitHub backup</h3><p>Optional manual backup to a repository you control. Do not paste your token into repository files.</p><div class="field"><label>Owner / repository</label><input id="repo" class="textfield" value="'+esc(backup)+'" placeholder="username/training-data"></div><div class="field"><label>GitHub fine-grained token</label><input id="token" class="textfield" type="password" placeholder="Contents read/write"></div><div class="actions"><button class="ghost" id="push">Back up</button><button class="ghost" id="pull">Restore</button></div><p class="note" id="sync-status"></p></div>');
 document.getElementById('export').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='training-log-'+eastern()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 document.getElementById('import').onclick=()=>document.getElementById('jsonfile').click();
 document.getElementById('jsonfile').onchange=async e=>{try{const next=JSON.parse(await e.target.files[0].text());if(next.schema!==2||!Array.isArray(next.lifts)||!Array.isArray(next.runs))throw Error('Wrong backup format');if(confirm('Replace your current local records?')){data={...fresh(),...next};save();render()}}catch(e){alert(e.message)}};
 const git=async pull=>{const repo=document.getElementById('repo').value.trim(),token=document.getElementById('token').value.trim(),out=document.getElementById('sync-status');if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!token)return alert('Enter a valid repository and token.');if(pull&&!confirm('This replaces local records. Export a backup first. Continue?'))return;localStorage.setItem('training_repo',repo);out.textContent='Contacting GitHub…';try{const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},url='https://api.github.com/repos/'+repo+'/contents/training-data.json';const get=await fetch(url,{headers,cache:'no-store'});if(pull){if(!get.ok)throw Error('No backup: HTTP '+get.status);const meta=await get.json(),raw=atob(meta.content.replace(/\s/g,'')),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),next=JSON.parse(new TextDecoder().decode(bytes));if(next.schema!==2||!Array.isArray(next.lifts)||!Array.isArray(next.runs))throw Error('Invalid backup');data={...fresh(),...next};save();out.textContent='Restored successfully';return}if(!get.ok&&get.status!==404)throw Error('GitHub: HTTP '+get.status);const old=get.ok?await get.json():null;const content=new TextEncoder().encode(JSON.stringify(data)),b64=btoa(Array.from(content,b=>String.fromCharCode(b)).join(''));const payload={message:'Update training records',content:b64,...(old?{sha:old.sha}:{})};const write=await fetch(url,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!write.ok)throw Error('Backup failed: HTTP '+write.status);out.textContent='Backed up successfully'}catch(e){out.textContent=e.message}};
 document.getElementById('push').onclick=()=>git(false);document.getElementById('pull').onclick=()=>git(true)
}
function render(){if(page==='today')todayPage();else if(page==='calendar')calendarPage();else if(page==='lift')liftPage();else if(page==='run')editRun(selected,planned('run',selected));else if(page==='history')historyPage();else if(page==='progress')progressPage();else if(page==='mobility')mobilityPage();else if(page==='routine')routinePage();else settingsPage()}
render();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
