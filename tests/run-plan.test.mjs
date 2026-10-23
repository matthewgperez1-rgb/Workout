import test from 'node:test';
import assert from 'node:assert/strict';
import {revisedRuns,resetDay} from '../modules/run-plan.mjs';
import {scheduleAt,moveSession,runKind} from '../modules/schedule.mjs';
import {fresh} from '../modules/store.mjs';
import {plus,weekday} from '../modules/dates.mjs';
import {expandWorkout,planFor,partsFromInputs,workoutStats} from '../modules/run-logging.mjs';
test('all six remaining weeks follow easy/speed/legs/rest/speed/long/rest without duplicate runs',()=>{
 const d=fresh();
 for(let w=0;w<6;w++)for(let day=0;day<7;day++){
  const date=plus('2026-10-26',w*7+day),runs=scheduleAt(d,'run',date),lifts=scheduleAt(d,'lift',date);
  assert.equal(runs.length,[0,1,4,5].includes(day)?1:0,date);
  if(runs.length)assert.equal(runKind(runs[0].info),{0:'easy',1:'quality',4:'quality',5:'long'}[day],date);
  if(day===2)assert.match(lifts[0].info.name,/Legs/);
  if(day===3||day===6)assert.equal(lifts.length,0,date+' full rest');
 }
 assert.equal(revisedRuns.length,24);assert.equal(new Set(revisedRuns.map(r=>r.id)).size,24);
});
test('reset suppresses unstarted sessions and retains existing lift and run records',()=>{
 const d=fresh();assert.ok(resetDay('2026-10-23'));
 for(const day of ['2026-10-23','2026-10-24','2026-10-25'])for(const kind of ['lift','run'])assert.equal(scheduleAt(d,kind,day).length,0);
 const record={id:'kept',planId:'tMH2fbNqGquuzcUeGRT7ri',date:'2026-10-23',title:'Original',workout:{steps:[{actualSeconds:61}]}};
 d.runs.push(record);const before=JSON.stringify(d);
 assert.equal(scheduleAt(d,'run','2026-10-23')[0].id,record.planId);assert.equal(JSON.stringify(d),before);
});
test('revision supersedes old unstarted moves while preserving started runs and later manual moves',()=>{
 const d=fresh();d.moves.run['2026-10-29']='2026-10-28';
 assert.equal(scheduleAt(d,'run','2026-10-28').length,0);
 const p=scheduleAt(d,'run','2026-10-27')[0];assert.match(p.info[0],/Pyramid/);
 moveSession(d,p,'2026-10-30');assert.equal(scheduleAt(d,'run','2026-10-27').length,0);assert.equal(scheduleAt(d,'run','2026-10-30').length,2);
 const logged=fresh();logged.runs.push({id:'old',planId:'gZR7x6C6toL4Qc76yCsEsv',sourceDate:'2026-10-29',date:'2026-10-29',title:'Already started',workout:{steps:[{actualSeconds:90}]}});
 const before=JSON.stringify(logged);assert.equal(scheduleAt(logged,'run','2026-10-27').length,0);assert.equal(scheduleAt(logged,'run','2026-10-29')[0].id,'gZR7x6C6toL4Qc76yCsEsv');assert.equal(JSON.stringify(logged),before);
});
test('pyramids retain mixed distances and recoveries through partial logging',()=>{
 const r=revisedRuns.find(r=>r.title.includes('Pyramid 200')),steps=expandWorkout(planFor(r.id));
 const work=steps.filter(s=>s.intensity==='INTERVAL');
 assert.deepEqual(work.map(s=>s.durationValue),[200,300,400,300,200]);
 assert.deepEqual(steps.filter(s=>s.intensity==='RECOVERY').map(s=>s.durationValue),[120,150,180,150]);
 const saved=partsFromInputs(r.id,work.slice(0,2).map((s,i)=>({key:s.key,time:String([50,80][i]),distance:''})));
 assert.equal(workoutStats(saved).complete,2);assert.equal(workoutStats(saved).workDistanceMeters,500);
 assert.equal(workoutStats(saved).averageSeconds,null);
 assert.ok(revisedRuns.every(r=>[1,2,5,6].includes(weekday(r.date))));
});
