export const pad=n=>String(n).padStart(2,'0');
export function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s;}
export function localDate(now=new Date(),timezone){const p=new Intl.DateTimeFormat('en-CA',{...(timezone?{timeZone:timezone}:{}),year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=k=>p.find(x=>x.type===k).value;return `${get('year')}-${get('month')}-${get('day')}`;}
export function plus(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export const weekday=date=>new Date(date+'T12:00:00Z').getUTCDay();
export const weekStart=date=>plus(date,-((weekday(date)+6)%7));
export function pretty(date,opts={weekday:'short',month:'short',day:'numeric'}){return validDate(date)?new Intl.DateTimeFormat('en-US',{...opts,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')):'Unknown date';}
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const stamp=()=>new Date().toISOString();
export const pace=(d,t)=>d>0&&t>0?`${Math.floor(Math.round(t/d)/60)}:${pad(Math.round(t/d)%60)}`:'—';
export const elapsed=r=>Number(r.minutes)*60+Number(r.seconds||0);
