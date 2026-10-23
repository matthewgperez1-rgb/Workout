// October 23 revision. Original plan sources remain intact for saved history.
export const RUN_PLAN_START='2026-10-26';
export const RUN_PLAN_REVISION='2026-10-23T00:00:00Z';
export const tredictPlanUrl='https://www.tredict.com/app/plans?activeTab=create&contentTab=planCalendar&planId=p5miKTCC1';
export const resetDay=date=>date>='2026-10-23'&&date<='2026-10-25';
export const runPlanGuidance='Mon easy · Tue speed · Wed legs · Thu rest · Fri speed · Sat long · Sun rest. Friday is lighter before the long run. Skip quality work when recovery is poor; never make up missed reps.';
export const resetGuidance='Recovery reset: no hard running or lifting this weekend. Optional gentle walking and mobility. Resume Monday only if recovered; otherwise keep resting.';
export const goalGuidance='Goal: under 2:40 for 880 yards (804.672 m). Equivalent splits at 2:40 are 39.8 sec/200 m and 79.5 sec/400 m. These are goal references, not required training paces. Use repeatable current fitness; most quality work is controlled at 6–7/10, at most 8/10. Stop if form deteriorates.';
const step=(intensity,durationType,durationValue,description)=>({type:'WorkoutStep',intensity,durationType,durationValue,targetType:'OPEN',description});
const time=(seconds,description,intensity='INTERVAL')=>step(intensity,'TIME',seconds,description);
const distance=(meters,description)=>step('INTERVAL','DISTANCE',meters,description);
const rest=seconds=>time(seconds,'Easy walk or jog; recover until breathing and form settle.','RECOVERY');
const intervals=(distances,recoveries,description)=>distances.flatMap((d,i)=>[distance(d,description),...(i<distances.length-1?[rest(Array.isArray(recoveries)?recoveries[i]:recoveries)]:[])]);
const timed=(durations,recoveries,description)=>durations.flatMap((d,i)=>[time(d,description),...(i<durations.length-1?[rest(Array.isArray(recoveries)?recoveries[i]:recoveries)]:[])]);
const quality=(work,description,warm=600,cool=480)=>({description:description+' '+goalGuidance,steps:[time(warm,'Easy jog, dynamic drills, and a few relaxed accelerations.','WARMUP'),...work,time(cool,'Easy jog or walk to cool down.','COOLDOWN')]});
const easy=minutes=>({description:'Conversational 2–3/10. Walk breaks allowed. Finish feeling able to do more; no fast finish.',steps:[time(minutes*60,'Easy conversational running; walk breaks allowed.')]});
// Week 3 is a reduced return; week 4 a cutback; week 8 a taper and retest.
// Friday volume is deliberately lower than Tuesday before Saturday's easy long run.
const weeks=[
 {m:25,l:35,t:['Pyramid 200–300–400–300–200',35,quality(intervals([200,300,400,300,200],[120,150,180,150],'Smooth controlled 6–7/10; let pace slow as distance rises.'),'Reduced return. Tuesday pyramid, not a race. Stop after the 400 if fatigue persists.')],f:['Fartlek 6 × 1 min',32,quality(timed([60,60,60,60,60,60],90,'Brisk relaxed 6/10; change gears without sprinting.'),'Friday lighter speed. Easy recoveries; leave plenty for Saturday.')]},
 {m:25,l:35,t:['880-yard Controlled Benchmark',27,quality([distance(805,'Watch target rounds to 805m; stop at the measured 880-yard finish. Even pacing at current fitness. Controlled hard, not an all-out opening sprint. Record the time; do not force 2:40.')],'Tuesday benchmark only if recovered. Otherwise 20–25 min easy. Reduced week.',720,600)],f:['6 × 20 sec Relaxed Speed',28,quality(timed([20,20,20,20,20,20],100,'Smooth acceleration, relaxed quick feet, 6–7/10; no maximal sprint.'),'Friday low-volume speed in the cutback week.')]},
 {m:30,l:45,t:['Ladder 200–400–600–400–200',38,quality(intervals([200,400,600,400,200],[120,180,240,180],'Repeatable 7/10. Longer reps slower; short reps relaxed and quick.'),'Tuesday speed-endurance ladder. Keep form consistent through the 600.')],f:['Cruise 3 × 3 min',31,quality(timed([180,180,180],120,'Comfortably hard 6–7/10; controlled breathing and rhythm.'),'Friday aerobic speed support, not a maximal interval session.')]},
 {m:30,l:45,t:['3 × (300m + 200m)',35,quality(intervals([300,200,300,200,300,200],[90,180,90,180,90],'300s strong and even, 200s smooth and a little quicker; 7/10.'),'Tuesday mixed-distance sets. 90 sec within pairs; 3 min between pairs.')],f:['Time Pyramid 1–2–3–2–1 min',34,quality(timed([60,120,180,120,60],[60,120,180,120],'Controlled 6–7/10. Match effort, not pace, as the repetition length changes.'),'Friday time pyramid. Recovery equals the preceding work duration.')]},
 {m:30,l:40,t:['2 × (400m + 200m)',31,quality(intervals([400,200,400,200],[120,240,120],'Repeatable 7–8/10. Finish each pair with smooth 200m form, not a sprint.'),'Tuesday broken-distance rehearsal. 2 min within pairs; 4 min between pairs.')],f:['6 × 150m Relaxed Speed',30,quality(intervals([150,150,150,150,150,150],90,'Fast but relaxed 6–7/10; full control throughout.'),'Friday short repetitions to sharpen without exhausting the legs.')]},
 {m:25,l:25,t:['4 × 200m Sharpening',28,quality(intervals([200,200,200,200],120,'Controlled 7/10 at repeatable current fitness. Finish fresh.'),'Tuesday taper: only four smooth repetitions, no additional hard work.')],f:['880-yard Re-test',27,quality([distance(805,'Watch target rounds to 805m. Run a measured 880 yards and stop at its finish. Start evenly, build through the middle, finish strongly. Sub-2:40 is a goal, not an obligation.')],'Friday retest only if recovered. Otherwise 20 min easy and defer the test. Log actual time and conditions.',720,600)]}
];
const plus=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
export const revisedRuns=weeks.flatMap((w,i)=>{
 const monday=plus(RUN_PLAN_START,i*7),week=i+3;
 const sources=[monday,plus(monday,3),plus(monday,4),plus(monday,5)];
 const rows=[['Easy '+w.m,w.m,easy(w.m),0],[w.t[0],w.t[1],w.t[2],1],[w.f[0],w.f[1],w.f[2],4],['Long Easy '+w.l,w.l,easy(w.l),5]];
 return rows.map(([name,minutes,workout,offset],j)=>{
  const title=`W${week} ${name}`,id=`cft-20261023-w${week}-${j}`,date=plus(monday,offset);
  const description=workout.description+' '+(j===3?'Saturday long run stays easy. Shorten or skip if Friday left you tired. ':'')+'Thursday and Sunday rest. No makeup sessions.';
  return {source:sources[j],date,id,title,minutes,week,day:i*7+offset+1,kind:j===1||j===2?'quality':j===3?'long':'easy',workout:{workoutName:title,description,sport:'RUNNING',steps:workout.steps.map((s,stepOrder)=>({...s,stepOrder}))}};
 });
});
export const revisedBySource=Object.fromEntries(revisedRuns.map(r=>[r.source,r]));
export const revisedWorkouts=Object.fromEntries(revisedRuns.map(r=>[r.id,r.workout]));
