export class RestTimer {
 constructor(storage){this.storage=storage;this.preset=60;this.remaining=60;this.until=0;try{Object.assign(this,JSON.parse(storage.getItem('training-log-timer')||'{}'));}catch{}this.tick();}
 persist(){try{this.storage.setItem('training-log-timer',JSON.stringify({preset:this.preset,remaining:this.remaining,until:this.until}));}catch{}}
 seconds(){return this.until?Math.max(0,Math.ceil((this.until-Date.now())/1000)):this.remaining;}
 tick(){if(this.until&&this.seconds()===0){this.until=0;this.remaining=0;this.persist();return true;}return false;}
 toggle(){if(this.until){this.remaining=this.seconds();this.until=0;}else {if(!this.remaining)this.remaining=this.preset;this.until=Date.now()+this.remaining*1000;}this.persist();}
 set(n){this.preset=n;this.remaining=n;this.until=0;this.persist();}
 reset(){this.remaining=this.preset;this.until=0;this.persist();}
}
