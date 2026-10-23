import {sessionsForDate,runSpecs,runDefaultMoves} from '../program.mjs';
import {revisedBySource,RUN_PLAN_REVISION,resetDay,resetGuidance} from './run-plan.mjs';
import {plus,weekday,validDate,stamp} from './dates.mjs';
export function templateAt(data,source){const log=data.lifts.find(l=>l.planId===`lift:${source}`||(!l.planId&&(l.sourceDate||l.date)===source));if(log)return {name:log.session,kind:'lift',coach:log.coach||'',moves:log.exercises.map(e=>[e.name,e.sets.length,e.target||e.sets[0]?.reps||0,0,e.tip||'',e.category||'Strength'])};const legacyTarget=Object.entries(data.moves.lift||{}).some(([s,t])=>s!==source&&t===source);return (!legacyTarget&&data.overrides[source])||sessionsForDate(source)[weekday(source)]||sessionsForDate(source)[0];}
// Twelve training weeks followed by one full recovery week; anchor is a Monday.
// Existing logs remain available and are never deleted or rescheduled.
export const RECOVERY_ANCHOR='2026-10-12';
export const RECOVERY_TRAINING_WEEKS=12;
export function recoveryWeek(date){
 if(!validDate(date)||date<RECOVERY_ANCHOR)return false;
 const weeks=Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse(RECOVERY_ANCHOR+'T12:00:00Z'))/604800000);
 return weeks%(RECOVERY_TRAINING_WEEKS+1)===RECOVERY_TRAINING_WEEKS;
}
export const recoveryGuidance='Recovery week: gentle mobility, stretching, relaxed walks or easy cycling only. Skip hard runs, heavy lifting and intervals. Keep everything comfortable and optional.';
export const runKind=info=>/threshold|speed|benchmark|re-test|repeats|drop sets|sharpening|endurance|pyramid|ladder|fartlek|cruise|\(\d+m/i.test(info?.[0]||'')?'quality':/long/i.test(info?.[0]||'')?'long':'easy';
export const recoveryDay=date=>resetDay(date)||recoveryWeek(date);
export const recoveryMessage=date=>resetDay(date)?resetGuidance:recoveryGuidance;
export function scheduleAt(data,kind,date){
 if(kind==='run')return runScheduleAt(data,date);
 if(!validDate(date))return [];const mapping={...(kind==='run'?runDefaultMoves:{}),...(data.moves[kind]||{})};for(const [source,r] of Object.entries(data.moveState?.[kind]||{}))if(r.target===null)delete mapping[source];const sources=new Set([date,...Object.keys(mapping).filter(s=>mapping[s]===date)]),out=[];
 for(const source of sources){const target=mapping[source]||source;if(target!==date)continue;const info=kind==='run'?runSpecs[source]:templateAt(data,source);if(!info||(kind==='lift'&&!info.moves?.length))continue;
 // Do not offer unstarted training in recovery weeks; preserve started/completed logs.
 const id=kind==='run'?info[3]:`lift:${source}`;
 const started=(kind==='run'?data.runs:data.lifts).some(x=>x.planId===id||(kind==='lift'&&(x.sourceDate||x.date)===source));
 if(recoveryDay(date)&&!started)continue;
 out.push({kind,date,source,id:kind==='run'?info[3]:`lift:${source}`,info});}return out;
}
function runScheduleAt(data,date){
 if(!validDate(date))return [];const out=[];
 for(const [source,original] of Object.entries(runSpecs)){
  const revision=revisedBySource[source];
  const log=data.runs.find(r=>r.planId===original[3]||(revision&&r.planId===revision.id)||r.sourceDate===source||(!r.planId&&r.date===(data.moves.run[source]||runDefaultMoves[source]||source)));
  const revised=revision&&(!log||log.planId===revision.id);
  const info=revised?[revision.title,revision.minutes,revision.workout.description,revision.id]:original;
  const move=data.moveState?.run?.[source];
  // Supersede old future moves for this revised block without deleting their history.
  const manual=!revision||move?.updated>=RUN_PLAN_REVISION;
  const fallback=revised?revision.date:(runDefaultMoves[source]||source);
  const target=log?.date||(manual?(move?.target===null?source:data.moves.run[source]||fallback):fallback);
  if(target!==date||(recoveryDay(date)&&!log))continue;
  out.push({kind:'run',date,source,id:info[3],info});
 }
 return out;
}
export function logFor(data,p){const list=data[p.kind==='run'?'runs':'lifts'];return list.find(x=>x.planId===p.id)||list.find(x=>!x.planId&&x.date===p.date&&(p.kind==='run'||x.session===p.info.name));}
export function moveSession(data,p,target){if(!validDate(target))throw Error('Choose a valid date.');if(logFor(data,p))throw Error('This session has already started. Its training date stays with the log.');if(target===p.source)delete data.moves[p.kind][p.source];else data.moves[p.kind][p.source]=target;data.moveState??={lift:{},run:{}};data.moveState[p.kind]??={};data.moveState[p.kind][p.source]={target:target===p.source?null:target,updated:stamp()};return warningsAt(data,target);}
const isLower=p=>p.info.focus==='lower'||/^(Lower|Legs)/.test(p.info.name);
export function warningsAt(data,date){const out=[],lifts=scheduleAt(data,'lift',date),runs=scheduleAt(data,'run',date),lower=lifts.some(isLower),quality=runs.some(p=>runKind(p.info)==='quality');if(recoveryWeek(date))out.push(recoveryGuidance);if(lifts.length>1||runs.length>1)out.push('Multiple sessions of the same type. Check that the extra session is intentional.');if(lower&&runs.some(p=>runKind(p.info)!=='easy'))out.push('Lower-body lifting and a quality or long run share this day. Consider reducing the lift or moving a session.');for(const n of [-1,1]){const other=plus(date,n),rl=scheduleAt(data,'run',other),ll=scheduleAt(data,'lift',other);if((quality&&(rl.some(p=>runKind(p.info)==='quality')||ll.some(isLower)))||(lower&&rl.some(p=>runKind(p.info)==='quality')))out.push('A demanding leg session is scheduled on an adjacent day. Check your recovery before training.');}return [...new Set(out)];}
export function blockPhase(source){const week=Math.floor((Date.parse(source+'T12:00:00Z')-Date.parse('2026-10-12T12:00:00Z'))/604800000)+1;return {week,reduce:[4,8,12].includes(week),label:week<1||week>12?'Template':week%4===0?'Reduced volume':week<=4?'Foundation':week<=8?'Build':'Consolidate'};}

