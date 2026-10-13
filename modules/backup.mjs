import {normalize,mergeData} from './store.mjs';
import {stamp} from './dates.mjs';
export class GitBackup {
 constructor(store){this.store=store;this.token='';this.repo='';this.auto=false;this.busy=false;this.status='Not connected';this.job=null;this.listen=null;store.onSave(()=>{if(this.token&&this.auto&&!this.busy){clearTimeout(this.job);this.job=setTimeout(()=>this.sync(),8000);}this.changed();});}
 changed(){this.listen?.();}
 disconnect(){this.token='';this.auto=false;clearTimeout(this.job);this.status='Disconnected · records stay local';this.changed();}
 async connect(repo,token,auto=false){if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!token)throw Error('Enter owner/repository and a fine-grained token.');this.repo=repo;this.token=token;this.auto=auto;this.store.storage.setItem('training_repo',repo);this.status='Connected for this app session';this.changed();}
 async request(method='GET',body){const r=await fetch(`https://api.github.com/repos/${this.repo}/contents/training-data.json`,{method,headers:{Authorization:`Bearer ${this.token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});if(!r.ok&&!(method==='GET'&&r.status===404))throw Error(r.status===409?'Backup changed while saving. Try again; your local records are safe.':`GitHub returned ${r.status}. Check token scope and repository access.`);return r.status===404?null:r.json();}
 decode(meta){const raw=Uint8Array.from(atob(meta.content.replace(/\s/g,'')),c=>c.charCodeAt(0));return normalize(JSON.parse(new TextDecoder().decode(raw)));}
 async sync(){if(this.busy)return;if(!this.token)throw Error('Connect GitHub first.');if(!navigator.onLine){this.status='Offline · backup queued locally';this.changed();return;}this.busy=true;this.status='Checking remote backup…';this.changed();try{
 const meta=await this.request(),remote=meta?this.decode(meta):null;
 if(remote){const merge=mergeData(this.store.data,remote);if(!this.store.snapshot('Before GitHub merge'))throw Error(this.store.error);this.store.data=merge.data;if(!this.store.save())throw Error(this.store.error);if(merge.conflicts){this.status=`${merge.conflicts} conflict${merge.conflicts===1?'':'s'} need review · remote unchanged`;return;}}
 const revision=this.store.data.updated,bytes=new TextEncoder().encode(JSON.stringify(this.store.data,null,2));let s='';for(const b of bytes)s+=String.fromCharCode(b);
 await this.request('PUT',{message:'Back up Training Log records',content:btoa(s),...(meta?{sha:meta.sha}:{})});
 this.store.storage.setItem('training-log-backup-at',stamp());if(this.store.data.updated===revision){this.store.pending=false;this.store.storage.setItem('training-log-pending','false');}this.status=this.store.pending?'Backed up · newer local changes queued':'Backed up to GitHub';
 }catch(e){this.status=e.message;}finally{this.busy=false;this.changed();}}
 async restore(){if(this.busy)return;if(!this.token)throw Error('Connect GitHub first.');this.busy=true;this.status='Reading GitHub backup…';this.changed();try{const meta=await this.request();if(!meta)throw Error('No training-data.json backup exists in that repository.');const m=this.store.import(this.decode(meta));this.status=`Merged ${m.added} records${m.conflicts?` · ${m.conflicts} conflicts to review`:''}`;}catch(e){this.status=e.message;}finally{this.busy=false;this.changed();}}
}
