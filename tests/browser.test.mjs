import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd();
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
let server,browser,base;
test.before(async()=>{
 server=createServer(async(req,res)=>{
  try{
   let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return}
   if((await stat(file)).isDirectory())file=path.join(file,'index.html');
   const bytes=await readFile(file);
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(bytes);
  }catch(e){res.writeHead(404).end('Missing')}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
});
test.after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve))});
test('mobile dashboard displays planned workout without manufacturing completion',async()=>{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/',{waitUntil:'networkidle'});
 assert.match(await page.locator('main').innerText(),/Upper A/);
 assert.match(await page.locator('main').innerText(),/Running|Easy/);
 assert.doesNotMatch(await page.locator('main').innerText(),/1 \/ 4 target/);
 assert.deepEqual(errors,[]);
 await page.close();
});
test('live lift set changes survive navigation and are not automatically complete',async()=>{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Start workout'}).click();
 await page.locator('input[data-e="0"][data-s="0"][data-k="weight"]').fill('25');
 await page.locator('input[data-e="0"][data-s="0"][data-k="reps"]').fill('5');
 await page.locator('input[data-e="0"][data-s="0"][data-k="done"]').check();
 await page.locator('nav button[data-tab="history"]').click();
 await page.locator('nav button[data-tab="today"]').click();
 assert.match(await page.locator('main').innerText(),/In progress/);
 await page.getByRole('button',{name:'Open log'}).click();
 assert.equal(await page.locator('input[data-e="0"][data-s="0"][data-k="weight"]').inputValue(),'25');
 assert.equal(await page.locator('input[data-e="0"][data-s="0"][data-k="done"]').isChecked(),true);
 await page.close();
});
test('independent mobility logging does not mark lifting complete',async()=>{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.locator('nav button[data-tab="mobility"]').click();
 await page.getByRole('button',{name:'Open routine'}).first().click();
 for(const e of await page.locator('[data-ms]').all())await e.check();
 await page.getByRole('button',{name:'Save routine'}).click();
 assert.match(await page.locator('main').innerText(),/Completed today/);
 await page.locator('nav button[data-tab="today"]').click();
 assert.match(await page.locator('main').innerText(),/Planned/);
 await page.close();
});

test('rest timer is visible, offers 60s, and survives navigating away',async()=>{
 const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Start workout'}).click();
 await page.locator('#tlg-rest-timer').waitFor();
 assert.equal(await page.locator('#tlg-clock').innerText(),'1:00');
 await page.getByRole('button',{name:'60 sec'}).click();
 await page.locator('#tlg-pause').click();
 await page.clock.resume();
 await page.waitForTimeout(1400);
 assert.match(await page.locator('#tlg-clock').innerText(),/^0:5[89]$/);
 assert.deepEqual(errors,[]);
 await page.close();
});
test('training session includes separate warm-up/cooldown and optional media controls',async()=>{
 const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Start workout'}).click();
 assert.equal(await page.locator('.tlg-stage').count(),2);
 assert.ok(await page.locator('.tlg-media').count()>0);
 const widths=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,body:document.body.scrollWidth}));
 assert.ok(widths.body<=widths.viewport+2,'No horizontal overflow: '+JSON.stringify(widths));
 await page.close();
});
