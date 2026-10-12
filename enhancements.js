/* Training Log: focused workout UX. Loads after the base app. */
(() => {
'use strict';
const dayISO = () => TODAY();
const previousFor = (name,date) => db.lifts
  .filter(l=>l.date<date && l.finished)
  .sort((a,b)=>b.date.localeCompare(a.date))
  .flatMap(l=>l.exercises.filter(e=>e.name===name).flatMap(e=>e.sets.filter(s=>s.done)))
  .at(0);
const integer = n => Number.isFinite(n)&&n>=0&&Math.floor(n)===n;
function saveActive() {
  if (!window.editSession) return true;
  const obj=window.editSession;
  const note=document.getElementById('lift-notes');
  if(note)obj.notes=note.value;
  obj.updated=stamp();
  const idx=db.lifts.findIndex(x=>x.id===obj.id||x.date===obj.date);
  if(idx>=0)db.lifts[idx]=obj;else db.lifts.push(obj);
  return persist();
}
function showDatePicker() {
  const old=currentDate;
  const value=prompt('Open date (YYYY-MM-DD)',old);
  if(value===null)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value+'T12:00:00Z'))){alert('Enter a valid date.');return}
  saveActive();currentDate=value;view('today');
}
window.pickDate=showDatePicker;
function addSet(exIndex) {
  const e=window.editSession?.exercises[exIndex];if(!e)return;
  const last=e.sets.at(-1)||{weight:0,reps:8,rir:2};
  e.sets.push({...last,done:false});
  saveActive();sessionEditor(window.editSession.date);
}
window.addSet=addSet;
function removeSet(exIndex) {
  const e=window.editSession?.exercises[exIndex];if(!e||e.sets.length<=1)return;
  if(e.sets.at(-1).done&&!confirm('Remove a completed set?'))return;
  e.sets.pop();saveActive();sessionEditor(window.editSession.date);
}
window.removeSet=removeSet;
function substitute(exIndex) {
 const e=window.editSession?.exercises[exIndex];if(!e)return;
 const text=prompt('Replacement movement name',e.name);
 if(!text||!text.trim()||text.length>80)return;
 e.name=text.trim();
 saveActive();sessionEditor(window.editSession.date);
}
window.substitute=substitute;
const existingTemplate=tempSession;
tempSession=function(date){
 const item=existingTemplate(date);
 if(db.lifts.some(l=>l.date===date))return item;
 const w=window.trainingCore?.trainingWeek(date);
 if(w&&w%4===0){
  item.exercises=item.exercises.map(e=>({...e,sets:e.sets.slice(0,Math.max(1,Math.ceil(e.sets.length*0.65)))}));
  item.notes=(item.notes||'')+'Reduced-volume week: move well, avoid grinding reps.';
 }
 return item;
};
const oldEditor=sessionEditor;
sessionEditor=function(date){
 oldEditor(date);
 const draft=window.editSession;
 if(!draft)return;
 const panel=document.querySelector('#main .card');
 if(!panel)return;
 const banner=document.createElement('div');
 banner.className='schedule';
 const done=draft.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);
 const total=draft.exercises.reduce((n,e)=>n+e.sets.length,0);
 banner.innerHTML='<div class="row"><strong>Set log</strong><span class="pill-small">'+done+' / '+total+' complete</span></div><div class="muted">Auto-saved on this device. Mark the checkbox as each set finishes.</div>';
 panel.querySelector('h2')?.after(banner);
 panel.querySelectorAll('.exercise').forEach((node,i)=>{
   const e=draft.exercises[i],previous=previousFor(e.name,date);
   const body=document.createElement('div');
   body.className='button-row';
   body.innerHTML='<button data-add>Add set</button><button data-remove>Remove set</button><button data-swap>Replace movement</button>';
   node.append(body);
   body.querySelector('[data-add]').addEventListener('click',()=>addSet(i));
   body.querySelector('[data-remove]').addEventListener('click',()=>removeSet(i));
   body.querySelector('[data-swap]').addEventListener('click',()=>substitute(i));
   if(previous){
      const note=document.createElement('div');
      note.className='muted';note.textContent='Last completed: '+previous.weight+' lb × '+previous.reps;
      body.before(note);
   }
 });
 panel.querySelectorAll('[data-k]').forEach(input=>{
   input.addEventListener('input',()=>{
     if(input.type==='checkbox')return;
     const e=draft.exercises[Number(input.dataset.e)],set=e?.sets[Number(input.dataset.s)];
     if(!set)return;
     const val=Number(input.value);
     if(!Number.isFinite(val)||val<0)return;
     set[input.dataset.k]=val;
     saveActive();
   });
 });
};
const oldSave=saveSession;
saveSession=function(finish){
 if(!window.editSession)return;
 if(finish){
   const completed=window.editSession.exercises.some(e=>e.sets.some(s=>s.done));
   if(!completed){alert('Record at least one completed set before finishing.');return}
 }
 oldSave(finish);
};
const oldRun=runEditor;
runEditor=function(date){
 oldRun(date);
 const run=window.editRun;
 const btn=document.getElementById('main')?.querySelector('button.primary');
 if(btn)btn.textContent='Save Garmin results';
 const note=document.createElement('p');note.className='muted';note.textContent='Enter actual results after your Garmin workout. No live watch tracking or GPS access.';
 document.querySelector('#main .card h2')?.after(note);
};
const oldHistory=history;
history=function(){
 let output=oldHistory();
 const runs=db.runs.slice().sort((a,b)=>b.date.localeCompare(a.date));
 if(runs.length>=2){
   output+='<section class="card"><h2>Recent running progress</h2>'+runs.slice(0,8).map(r=>{
      const seconds=Number(r.minutes)*60+Number(r.seconds);
      return '<div class="mini-row"><span>'+escapeHTML(r.date)+'</span><span>'+Number(r.distance).toFixed(2)+' mi · '+pace(r.distance,seconds)+'/mi</span></div>';
   }).join('')+'</section>';
 }
 return output;
};
const oldProgress=progress;
progress=function(){
 let output=oldProgress();
 const recent=db.runs.filter(r=>r.distance>0&&r.minutes*60+r.seconds>0).slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(-12);
 if(recent.length>=2){
   const speeds=recent.map(r=>((Number(r.minutes)*60+Number(r.seconds))/Number(r.distance)));
   const min=Math.min(...speeds),max=Math.max(...speeds),spread=Math.max(20,max-min);
   const points=speeds.map((v,i)=>(30+i*540/(speeds.length-1))+','+(25+(v-min)/spread*110)).join(' ');
   output+='<section class="card"><h2>Running pace trend</h2><p class="muted">Lower is faster. Compare similar distances and efforts for meaningful changes.</p><div class="chart-wrap"><svg class="chart-svg" viewBox="0 0 600 165" role="img" aria-label="Run pace chart"><line x1="25" y1="143" x2="575" y2="143" stroke="#597188"/><polyline points="'+points+'" fill="none" stroke="#6fddc5" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg></div></section>';
 }
 return output;
};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
})();