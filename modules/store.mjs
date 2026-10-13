import {validDate,stamp} from './dates.mjs';
export const KEY='rangeboard_v2';
export const fresh=()=>({schema:2,lifts:[],runs:[],mobility:[],measurements:[],moves:{lift:{},run:{}},overrides:{},notes:{},conflicts:[],audit:[],customExercises:[],updated:null});
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const number=v=>v!==''&&v!==null&&Number.isFinite(Number(v))&&Number(v)>=0;
export function validateData(v){
 if(!object(v)||v.schema!==2||!Array.isArray(v.lifts)||!Array.isArray(v.runs))throw Error('This is not a schema 2 Training Log backup.');
 for(const key of ['mobility','measurements','conflicts','audit','customExercises'])if(v[key]!==undefined&&!Array.isArray(v[key]))throw Error(`Invalid ${key} list.`);
 for(const l of v.lifts){if(!object(l)||!validDate(l.date)||typeof l.session!=='string'||!Array.isArray(l.exercises))throw Error('Invalid lifting record.');for(const e of l.exercises){if(!object(e)||typeof e.name!=='string'||!Array.isArray(e.sets))throw Error('Invalid exercise record.');for(const s of e.sets)if(!object(s)||!number(s.weight??0)||!number(s.reps??0)||typeof s.done!=='boolean')throw Error('Invalid completed-set data.');}}
 for(const r of v.runs)if(!object(r)||!validDate(r.date)||!number(r.distance)||Number(r.distance)<=0||!Number.isInteger(Number(r.minutes))||Number(r.minutes)<0||!Number.isInteger(Number(r.seconds??0))||Number(r.seconds??0)<0||Number(r.seconds??0)>59||Number(r.minutes)*60+Number(r.seconds??0)<=0)throw Error('Invalid run distance or elapsed time.');
 for(const r of v.mobility||[])if(!object(r)||!validDate(r.date)||typeof r.program!=='string'||(r.checks!==undefined&&!Array.isArray(r.checks)))throw Error('Invalid mobility record.');
 if(v.moves!==undefined){if(!object(v.moves))throw Error('Invalid schedule.');for(const kind of ['lift','run']){if(v.moves[kind]!==undefined&&!object(v.moves[kind]))throw Error('Invalid schedule map.');for(const [a,b] of Object.entries(v.moves[kind]||{}))if(!validDate(a)||!validDate(b))throw Error('Invalid moved workout date.');}}
 for(const k of ['overrides','notes'])if(v[k]!==undefined&&!object(v[k]))throw Error('Invalid '+k);return true;
}
export function normalize(v){validateData(v);return {...fresh(),...structuredClone(v),moves:{lift:{},run:{},...structuredClone(v.moves||{})}};}
export const recordKey=(kind,r)=>r.id||`${kind}:${r.date}:${r.session||r.program||''}`;
function comparable(r){const x={...r};delete x.updated;return JSON.stringify(x);}
export function mergeData(local,incoming){
 const a=normalize(local),b=normalize(incoming),out=structuredClone(a),conflicts=[...(a.conflicts||[])];let added=0;
 const addConflict=c=>{if(!conflicts.some(x=>x.key===c.key&&JSON.stringify(x.incoming)===JSON.stringify(c.incoming)))conflicts.push(c);};
 for(const k of ['lifts','runs','mobility','measurements','customExercises']){const map=new Map(out[k].map(r=>[recordKey(k,r),r]));for(const r of b[k]){const id=recordKey(k,r),old=map.get(id);if(!old){map.set(id,r);added++;}else if(comparable(old)!==comparable(r))addConflict({key:k+':'+id,kind:k,id,local:old,incoming:r});}out[k]=[...map.values()];}
 for(const k of ['lift','run'])for(const [source,target] of Object.entries(b.moves[k])){if(out.moves[k][source]&&out.moves[k][source]!==target)addConflict({key:`moves.${k}:${source}`,kind:`moves.${k}`,id:source,local:out.moves[k][source],incoming:target});else out.moves[k][source]=target;}
 for(const k of ['overrides','notes'])for(const [id,v] of Object.entries(b[k])){if(out[k][id]!==undefined&&JSON.stringify(out[k][id])!==JSON.stringify(v))addConflict({key:k+':'+id,kind:k,id,local:out[k][id],incoming:v});else out[k][id]=v;}
 for(const c of b.conflicts||[])addConflict(c);
 out.audit=[...a.audit,...b.audit].filter((r,i,all)=>all.findIndex(x=>JSON.stringify(x)===JSON.stringify(r))===i);
 out.conflicts=conflicts;out.updated=stamp();return {data:out,added,conflicts:conflicts.length};
}
export function resolveConflict(data,index,useIncoming){const c=data.conflicts[index];if(!c)return;data.audit.push({at:stamp(),reason:'Resolve backup conflict',kind:c.kind,before:structuredClone(c),selected:useIncoming?'incoming':'local'});if(useIncoming){if(c.kind.startsWith('moves.'))data.moves[c.kind.split('.')[1]][c.id]=c.incoming;else if(Array.isArray(data[c.kind])){const i=data[c.kind].findIndex(x=>recordKey(c.kind,x)===c.id);if(i>=0)data[c.kind][i]=c.incoming;else data[c.kind].push(c.incoming);}else data[c.kind][c.id]=c.incoming;}data.conflicts.splice(index,1);}
export class TrainingStore {
 constructor(storage){this.storage=storage;this.error=null;this.pending=false;this.listeners=new Set();this.lastRaw=null;try{const raw=storage.getItem(KEY);this.data=raw?normalize(JSON.parse(raw)):fresh();this.lastRaw=raw;if(raw&&!storage.getItem('training-log-pre-v3'))storage.setItem('training-log-pre-v3',raw);}catch(e){this.error='Stored records could not be read safely: '+e.message;this.data=fresh();this.blocked=true;}}
 onSave(fn){this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
 save(){if(this.blocked)return false;try{validateData(this.data);const concurrent=this.storage.getItem(KEY);if(concurrent&&concurrent!==this.lastRaw){this.data=mergeData(this.data,JSON.parse(concurrent)).data;}this.data.updated=stamp();const raw=JSON.stringify(this.data);this.storage.setItem(KEY,raw);this.lastRaw=raw;this.storage.setItem('training-log-pending','true');this.pending=true;this.error=null;for(const fn of this.listeners)fn();return true;}catch(e){this.error='Not saved: '+e.message;return false;}}
 snapshot(reason){try{const versions=JSON.parse(this.storage.getItem('training-log-recovery')||'[]');versions.unshift({at:stamp(),reason,data:structuredClone(this.data)});this.storage.setItem('training-log-recovery',JSON.stringify(versions.slice(0,8)));return true;}catch(e){this.error='Recovery copy failed. Export JSON before making this change.';return false;}}
 audit(kind,record,reason){if(!this.snapshot(reason))return false;this.data.audit.push({at:stamp(),kind,reason,before:structuredClone(record)});return true;}
 import(value){const next=normalize(value);if(!this.snapshot('Before import'))throw Error(this.error);const m=mergeData(this.data,next);this.data=m.data;if(!this.save())throw Error(this.error);return m;}
}
