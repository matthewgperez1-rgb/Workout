// Range Board/Training Log domain regression checks. Run: node --test tests/domain.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

function dateNY(date) {
  const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=t=>p.find(x=>x.type===t).value;
  return get('year')+'-'+get('month')+'-'+get('day');
}
function pace(distance,seconds) {
  if(!(distance>0&&seconds>0))return '—';
  const v=Math.round(seconds/distance);
  return Math.floor(v/60)+':'+String(v%60).padStart(2,'0');
}
function validRun(r) {
  return r.distance>0&&Number.isFinite(r.distance)&&Number.isInteger(r.minutes)&&r.minutes>=0&&Number.isInteger(r.seconds)&&r.seconds>=0&&r.seconds<60&&r.minutes*60+r.seconds>0&&r.effort>=1&&r.effort<=10;
}
function previous(lifts,name,date) {
  return lifts.filter(x=>x.date<date).sort((a,b)=>b.date.localeCompare(a.date))
    .flatMap(l=>l.exercises.filter(e=>e.name===name).flatMap(e=>e.sets.filter(s=>s.done)));
}
test('timezone before NY midnight remains prior date',()=>assert.equal(dateNY(new Date('2026-10-13T03:30:00Z')),'2026-10-12'));
test('timezone after NY midnight advances',()=>assert.equal(dateNY(new Date('2026-10-13T04:01:00Z')),'2026-10-13'));
test('pace 3 miles in 30 minutes',()=>assert.equal(pace(3,1800),'10:00'));
test('pace zero distance safe',()=>assert.equal(pace(0,1800),'—'));
test('reject invalid seconds',()=>assert.equal(validRun({distance:3,minutes:25,seconds:75,effort:4}),false));
test('reject negative time',()=>assert.equal(validRun({distance:3,minutes:-2,seconds:0,effort:4}),false));
test('accept valid Garmin result',()=>assert.equal(validRun({distance:3.2,minutes:31,seconds:9,effort:6}),true));
test('previous completed set excludes future and incomplete sets',()=>{
 const lifts=[{date:'2026-10-14',exercises:[{name:'Press',sets:[{done:true,weight:100,reps:5}]}]},
 {date:'2026-10-12',exercises:[{name:'Press',sets:[{done:false,weight:99,reps:9},{done:true,weight:35,reps:8}]}]}];
 assert.deepEqual(previous(lifts,'Press','2026-10-13'),[{done:true,weight:35,reps:8}]);
});
