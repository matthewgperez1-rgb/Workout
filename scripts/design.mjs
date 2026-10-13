import {writeFile,mkdir} from 'node:fs/promises';
import {fresh} from '../modules/store.mjs';
import {RestTimer} from '../modules/timer.mjs';
import {views} from '../modules/views.mjs';
import {scheduleAt} from '../modules/schedule.mjs';
import {icon} from '../modules/ui.mjs';
const data=fresh(),p=scheduleAt(data,'lift','2026-10-13')[0],mem={getItem:()=>null};
const context={data,selected:'2026-10-13',today:'2026-10-13',weekShift:0,activeLift:'design-only',timer:new RestTimer(mem),query:'',group:'All',equipment:'All',onlyMatching:true,store:{storage:mem},backup:{status:'Not connected'}};
data.lifts=[{id:'design-only',date:'2026-10-13',session:p.info.name,finished:false,stages:{},exercises:p.info.moves.map(m=>({name:m[0],category:m[5],sets:Array.from({length:m[1]},()=>({weight:0,reps:m[2],done:false}))}))}];
await mkdir('docs/design',{recursive:true});
const screens=['today','plan','lift','mobility','progress'];
for(const name of screens){const body=views[name](context);await writeFile(`docs/design/${name}.html`,`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../../"><link rel="stylesheet" href="app.css"><title>Design-only · ${name}</title></head><body><div style="font:10px system-ui;text-align:center;padding:8px;color:#a6acb7">DESIGN-ONLY COMP · NO SAVED PERFORMANCE DATA</div><div class="shell"><header class="top"><div class="brand"><img src="icon.svg" alt=""><span>TRAINING LOG</span></div>${icon('settings')}</header><main class="main">${body}</main></div></body></html>`);}
