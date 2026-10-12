/* Training Log: pure workout analytics and progression logic. No browser APIs. */
export const BLOCK_START = '2026-10-12';
export function trainingWeek(date,start=BLOCK_START){
 const a=Date.parse(start+'T12:00:00Z'),b=Date.parse(date+'T12:00:00Z');
 if(!Number.isFinite(a)||!Number.isFinite(b))return null;
 return Math.max(1,Math.min(12,Math.floor((b-a)/604800000)+1));
}
export function phaseForWeek(week){
 if(week===4||week===8||week===12)return {label:'Reduced load',factor:0.65,effort:'Keep 3–4 reps in reserve'};
 if(week<=4)return {label:'Foundation',factor:1,effort:'Start with 2–3 reps in reserve'};
 if(week<=8)return {label:'Build',factor:1,effort:'Most sets at 1–3 reps in reserve'};
 return {label:'Consolidate',factor:1,effort:'Maintain quality and repeatable strength'};
}
export function prescribe(exercise,history,date){
 const completed=history.filter(l=>l.date<date&&l.finished).sort((a,b)=>b.date.localeCompare(a.date));
 const e=completed.flatMap(l=>(l.exercises||[]).filter(x=>x.name===exercise.name)).at(0);
 if(!e)return {message:'Establish baseline. Choose a comfortable load; leave 2–3 good reps in reserve.',load:null};
 const sets=e.sets.filter(x=>x.done&&Number.isFinite(+x.reps)&&Number.isFinite(+x.weight));
 if(!sets.length)return {message:'No completed sets previously recorded.',load:null};
 const target=exercise.sets?.[0]?.reps??8;
 const good=sets.length>=2&&sets.every(x=>+x.reps>=target&&+x.rir>=1&&+x.rir<=3);
 const last=sets[sets.length-1];
 if(last.weight<=0)return {message:'Try to improve control or add a rep before increasing difficulty.',load:0};
 const delta=last.weight<50?2.5:5;
 return good?{message:'Previous sets met the rep target. Consider adding '+delta+' lb if form stays clean.',load:last.weight+delta}
 :{message:'Repeat '+last.weight+' lb and build quality reps toward '+target+'.',load:last.weight};
}
export function liftSummary(logs){
 const valid=logs.filter(l=>l.finished);
 const sets=valid.flatMap(l=>(l.exercises||[]).flatMap(e=>e.sets.filter(s=>s.done&&+s.reps>0).map(s=>({name:e.name,date:l.date,reps:+s.reps,weight:+s.weight||0,rir:+s.rir}))));
 const best={};for(const s of sets){if(!best[s.name]||s.weight>best[s.name].weight||(s.weight===best[s.name].weight&&s.reps>best[s.name].reps))best[s.name]=s}
 return {sessions:valid.length,sets:sets.length,best};
}
export function runSummary(runs){
 const valid=runs.filter(r=>r.distance>0&&r.minutes*60+r.seconds>0);
 const miles=valid.reduce((n,r)=>n+Number(r.distance),0);
 const seconds=valid.reduce((n,r)=>n+Number(r.minutes)*60+Number(r.seconds),0);
 return {sessions:valid.length,miles,seconds,averagePaceSeconds:miles>0?seconds/miles:null};
}
export function dedupeByDateId(runs){const map=new Map();for(const r of runs){const k=r.id||r.date;if(!map.has(k)||String(r.updated||'')>String(map.get(k).updated||''))map.set(k,r)}return [...map.values()]}
export function validateBackup(value){return !!value&&value.schema===2&&Array.isArray(value.lifts)&&Array.isArray(value.runs)&&(!value.mobility||Array.isArray(value.mobility))}
