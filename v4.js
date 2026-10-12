/* Training Log v4: focused dashboard, warm-up, cooldown, photos, and persistent timer. */
(() => {
'use strict';
const warm = {
  1:[['Light cardio / arm circles','3 min'],['Scapular push-ups','10 reps'],['Band pull-aparts','12 reps'],['Progressive press warm-up sets','2 light sets']],
  2:[['Easy bike or walk','3 min'],['Ankle rocks','10 each'],['Bodyweight squat','10 reps'],['Progressive squat warm-up sets','2 light sets']],
  4:[['Light cardio','3 min'],['Scapular pull-ups','8 reps'],['Band rows','12 reps'],['Progressive pulling warm-up sets','2 light sets']],
  5:[['Easy walk / bike','3 min'],['Hip hinge practice','10 reps'],['Glute bridge','10 reps'],['Progressive deadlift warm-up sets','2 light sets']]
};
const cool={
  1:[['Easy walking','2 min'],['Gentle doorway pec stretch','30 sec each'],['Thoracic rotation','6 each']],
  2:[['Easy walk','2 min'],['Hip flexor stretch','30 sec each'],['Calf stretch','30 sec each']],
  4:[['Easy walk','2 min'],['Lat reach stretch','30 sec each'],['Thoracic rotation','6 each']],
  5:[['Easy walk','2 min'],['Hip 90/90 transitions','8 total'],['Calf stretch','30 sec each']]
};
const exerciseAliases={
 'DB bench press':'Dumbbell_Bench_Press','Chest-supported DB row':'Dumbbell_Incline_Row','Pull-up or assisted pull-up':'Pullups',
 'Romanian deadlift':'Romanian_Deadlift_With_Dumbbells','Goblet or front squat':'Goblet_Squat','Trap bar deadlift':'Trap_Bar_Deadlift',
 'Reverse lunge':'Dumbbell_Lunges','Calf raise':'Standing_Calf_Raises','Hammer curl':'Hammer_Curls',
 'Face pull':'Face_Pull','Step-up':'Dumbbell_Step_Ups','Hip thrust or glute bridge':'Barbell_Hip_Thrust',
 'Scapular push-ups':'Scapular_Push-Up','Bodyweight squat':'Bodyweight_Squat','Glute bridge':'Butt_Lift_Bridge',
 'Hip flexor stretch':'Kneeling_Hip_Flexor','Calf stretch':'Calf_Stretch_Hands_Against_Wall',
 'Doorway pec stretch':'Doorway_Stretch'
};
let catalogPromise=null;
const simplify = s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
async function getExerciseInfo(name){
  catalogPromise ||=fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json')
   .then(r=>{if(!r.ok)throw Error('Exercise guide unavailable');return r.json()}).catch(e=>{catalogPromise=null;throw e});
  const exercises=await catalogPromise, alias=exerciseAliases[name];
  const target=simplify(alias||name);
  const match=exercises.find(e=>simplify(e.id)===target)||exercises.find(e=>simplify(e.name)===target);
  return match||null;
}
window.trainingPhoto = async (btn,name)=>{
 const holder=btn.parentElement.querySelector('.tlg-photo-wrap');
 if(!holder)return;
 if(holder.dataset.open==='yes'){holder.replaceChildren();holder.dataset.open='no';return}
 holder.textContent='Loading reference…';
 try{
  const info=await getExerciseInfo(name);
  if(!info?.images?.length){holder.textContent='No verified photo for this movement.';return}
  const raw='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'+info.images[0].split('/').map(encodeURIComponent).join('/');
  const photo=document.createElement('img');photo.className='tlg-photo';photo.loading='lazy';photo.alt='Reference photograph of '+info.name;
  photo.onerror=()=>{holder.textContent='Photo unavailable. Follow the movement notes.'};
  photo.src=raw;
  const credit=document.createElement('p');credit.className='tlg-media-credit';credit.textContent='Reference: free-exercise-db · movement may differ from your programmed variation.';
  holder.replaceChildren(photo,credit);holder.dataset.open='yes';
 }catch(e){holder.textContent='Photo unavailable offline. Training instructions still work.'}
};
const oldDashboard=today;
today=function(){
 const date=currentDate,p=plan(date),r=runSpecs[date],lift=db.lifts.find(x=>x.date===date),run=db.runs.find(x=>x.date===date);
 const liftStatus=lift?.finished?'Done':lift?'In progress':p.kind==='lift'?'Ready':'Optional';
 const runStatus=run?'Recorded':r?'Planned':'—';
 const weekly=trainingConsistency();
 let h='<div class="day-card"><div class="tlg-compact-head"><span class="tag">TODAY · LIFT</span><span class="pill-small">'+liftStatus+'</span></div><h2>'+escapeHTML(p.name)+'</h2><p>'+p.moves.length+' movements</p>';
 if(p.moves.length)h+='<button class="primary" onclick="sessionEditor(\''+date+'\')">'+(lift?'Continue / review workout':'Start workout')+'</button>';
 h+='</div><div class="day-card"><div class="tlg-compact-head"><span class="tag">TODAY · RUN</span><span class="pill-small">'+runStatus+'</span></div><h2>'+(r?escapeHTML(r[0]):run?'Completed run':'No planned run')+'</h2>';
 h+='<p>'+(run?run.distance+' mi · '+pace(run.distance,run.minutes*60+run.seconds)+' /mi':r?r[1]+' min planned':'Log an unplanned Garmin run if needed')+'</p><button onclick="runEditor(\''+date+'\')">'+(run?'Edit Garmin results':'Log Garmin results')+'</button></div>';
 h+='<div class="card"><div class="tlg-compact-head"><h3>Optional mobility</h3><button onclick="view(\'mobility\')">All routines</button></div><div class="button-row"><button onclick="openMobility(\'shoulder\')">Shoulders · 10m</button><button onclick="openMobility(\'hip\')">Hips / ankles · 12m</button></div></div>';
 h+='<div class="card"><div class="tlg-compact-head"><h3>This week</h3><span class="tlg-mini">'+weekly.filter(x=>x.done).length+' active days</span></div><div class="timeline">'+weekly.map(x=>'<span class="'+(x.done?'hit':'')+'">'+dateShort(x.date).split(',')[0]+'</span>').join('')+'</div></div>';
 return h;
};
const oldEditor=sessionEditor;
sessionEditor=function(date){
 oldEditor(date);
 const root=document.querySelector('#main'),panel=root?.querySelector('.card'),session=window.editSession;if(!panel||!session)return;
 panel.querySelectorAll('.exercise').forEach((node,i)=>{
   const name=session.exercises[i].name;
   const button=document.createElement('button');button.className='tlg-media';button.type='button';button.textContent='View photo (optional)';
   button.addEventListener('click',()=>window.trainingPhoto(button,name));
   const wrap=document.createElement('div');wrap.className='tlg-photo-wrap';
   node.querySelector('.movement-info')?.after(button,wrap) || node.append(button,wrap);
 });
 const pDate=new Date(date+'T12:00:00'),weekday=pDate.getDay();
 const prep=warm[weekday]||[['Easy cardio','3 min'],['Practice first movement','2 light sets']];
 const finish=cool[weekday]||[['Slow walk','3 min'],['Gentle stretching','3 min']];
 const stage=(key,title,items)=>{
  session.stages ||= {};session.stages[key] ||= [];
  const section=document.createElement('section');section.className='tlg-stage';
  section.innerHTML='<div class="tlg-compact-head"><h3>'+title+'</h3><span class="tlg-skip">Separate from working sets</span></div>';
  items.forEach(([name,dose],i)=>{
   const line=document.createElement('div');line.className='tlg-stage-item';
   const input=document.createElement('input');input.type='checkbox';input.checked=session.stages[key].includes(i);input.setAttribute('aria-label',name+' complete');
   input.addEventListener('change',()=>{
     const arr=session.stages[key];if(input.checked&&!arr.includes(i))arr.push(i);if(!input.checked)session.stages[key]=arr.filter(x=>x!==i);
     if(window.editSession)autosaveLift();
   });
   const label=document.createElement('span');label.textContent=name+' · '+dose;
   const media=document.createElement('button');media.className='tlg-media';media.textContent='Photo';media.type='button';
   const photo=document.createElement('div');photo.className='tlg-photo-wrap';
   media.addEventListener('click',()=>window.trainingPhoto(media,name));
   line.append(input,label,media);
   section.append(line,photo);
  });
  return section;
 };
 const warmup=stage('warmup','Warm-up',prep),cooldown=stage('cooldown','Cooldown',finish);
 const header=panel.querySelector('h2');
 if(header)header.before(warmup);
 const actions=panel.querySelector('.actions');
 if(actions)actions.before(cooldown);else panel.append(cooldown);
 const timer=document.createElement('div');timer.className='tlg-timer';timer.id='tlg-rest-timer';
 timer.innerHTML='<div class="tlg-timer-main"><div><div class="tag">REST TIMER</div><div class="tlg-timer-digit" id="tlg-clock">1:00</div></div><button class="primary" id="tlg-pause">Start</button></div><div class="tlg-timer-actions"><button data-time="60" class="selected">60 sec</button><button data-time="90">90 sec</button><button data-time="120">2 min</button><button id="tlg-reset">Reset</button></div>';
 root.insertBefore(timer,panel);
 window.tlgTimerMount(timer);
 // Hide superseded rest timer, avoid two conflicting controls.
 const old=panel.querySelector('#rest-count');
 if(old){const box=old.closest('.row');if(box)box.style.display='none'}
};
let duration=60,until=null,remaining=60,interval=null;
function formatTime(sec){return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
function updateTimer(){
 const node=document.querySelector('#tlg-rest-timer');if(!node)return;
 if(until!==null)remaining=Math.max(0,Math.ceil((until-Date.now())/1000));
 node.querySelector('#tlg-clock').textContent=formatTime(remaining);
 node.classList.toggle('done',remaining===0);
 node.querySelector('#tlg-pause').textContent=until===null?(remaining===duration?'Start':'Resume'):'Pause';
 if(until!==null&&remaining===0){until=null;clearInterval(interval);interval=null;node.querySelector('#tlg-pause').textContent='Start';if(navigator.vibrate)navigator.vibrate(120)}
}
window.tlgTimerMount=(node)=>{
 node.querySelectorAll('[data-time]').forEach(btn=>btn.addEventListener('click',()=>{
  duration=Number(btn.dataset.time);until=null;remaining=duration;
  node.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('selected',b===btn));updateTimer();
 }));
 node.querySelector('#tlg-pause').addEventListener('click',()=>{
  if(until!==null){remaining=Math.max(0,Math.ceil((until-Date.now())/1000));until=null;}
  else {if(remaining===0)remaining=duration;until=Date.now()+remaining*1000;}
  updateTimer();
 }));
 node.querySelector('#tlg-reset').addEventListener('click',()=>{until=null;remaining=duration;updateTimer()});
 node.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.time)===duration));
 updateTimer();if(interval)clearInterval(interval);interval=setInterval(updateTimer,250);
};
const previousMobility=openMobility;
openMobility=function(id){
 previousMobility(id);
 const m=mobilityPrograms.find(x=>x.id===id),root=document.querySelector('#main .card');if(!m||!root)return;
 root.querySelectorAll('.mobility-step').forEach((line,i)=>{
  const [name]=m.steps[i];
  const btn=document.createElement('button');btn.className='tlg-media';btn.textContent='View photo';
  const wrap=document.createElement('div');wrap.className='tlg-photo-wrap';
  btn.addEventListener('click',()=>window.trainingPhoto(btn,name));
  line.append(btn,wrap);
 });
};
})();