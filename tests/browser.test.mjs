import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
let server,browser,base;
test.before(async()=>{
 server=createServer(async(req,res)=>{
  try{let filename=path.resolve(process.cwd(),'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(!filename.startsWith(process.cwd()+path.sep)&&filename!==process.cwd()){res.writeHead(403).end();return}
   if((await stat(filename)).isDirectory())filename=path.join(filename,'index.html');
   let type=filename.endsWith('.mjs')?'text/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.html')?'text/html':filename.endsWith('.json')?'application/json':'text/plain';
   res.writeHead(200,{'Content-Type':type});res.end(await readFile(filename));
  }catch{res.writeHead(404).end('Missing')}
 });await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
test.after(async()=>{await browser?.close();await new Promise(ok=>server?.close(ok))});
async function newPage(){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-10-12T15:00:00-04:00')});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/',{waitUntil:'networkidle'});return {page,errors};
}
test('home shows independently planned lift and Garmin run',async()=>{
 const {page,errors}=await newPage();
 assert.match(await page.locator('main').innerText(),/Upper A/);
 assert.match(await page.locator('main').innerText(),/Easy.*Strides/);
 assert.ok(await page.locator('.stage').count()===1);
 assert.deepEqual(errors,[]);
 const width=await page.evaluate(()=>({scroll:document.body.scrollWidth,viewport:document.documentElement.clientWidth}));
 assert.ok(width.scroll<=width.viewport+2,JSON.stringify(width));
 await page.close();
});
test('calendar shows two sessions on Monday and allows moving run to Tuesday',async()=>{
 const {page,errors}=await newPage();
 await page.getByRole('button',{name:'Plan'}).click();
 assert.equal(await page.locator('.session').count()>=2,true);
 await page.locator('.session.run').first().click();
 await page.getByRole('button',{name:'Move workout'}).click();
 await page.locator('[data-target="2026-10-13"]').click();
 const moves=await page.evaluate(()=>JSON.parse(localStorage.getItem('rangeboard_v2')).moves.run);
 assert.equal(moves['2026-10-12'],'2026-10-13');
 assert.match(await page.locator('main').innerText(),/Easy.*Strides/);
 assert.deepEqual(errors,[]);
 await page.close();
});
test('live strength log saves set and preserves it after leaving',async()=>{
 const {page,errors}=await newPage();
 await page.getByRole('button',{name:/Open workout/}).click();
 await page.locator('[data-field="weight"]').first().fill('30');
 await page.locator('[data-field="weight"]').first().dispatchEvent('change');
 await page.locator('[data-field="done"]').first().check();
 await page.locator('[data-page="today"]').click();
 await page.getByRole('button',{name:/Open workout/}).click();
 assert.equal(await page.locator('[data-field="weight"]').first().inputValue(),'30');
 assert.equal(await page.locator('[data-field="done"]').first().isChecked(),true);
 assert.deepEqual(errors,[]);
 await page.close();
});
test('rest timer offers 60 second option and mobility is independent',async()=>{
 const {page,errors}=await newPage();
 await page.getByRole('button',{name:/Open workout/}).click();
 await page.locator('[data-timer="60"]').click();
 assert.equal(await page.locator('#timer-value').innerText(),'1:00');
 await page.getByRole('button',{name:'Mobility'}).click();
 assert.equal(await page.locator('.mobility-card').count(),8);
 assert.deepEqual(errors,[]);
 await page.close();
});
test('font and backgrounds remain readable without layered themes',async()=>{
 const {page}=await newPage();
 const styles=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,color:getComputedStyle(document.body).color,stylesheets:document.styleSheets.length}));
 assert.equal(styles.bg,'rgb(248, 247, 243)');
 assert.equal(styles.color,'rgb(25, 38, 32)');
 assert.equal(styles.stylesheets,1);
 await page.close();
});

test('visual audit captures dashboard and calendar',async()=>{
 const {page}=await newPage();
 const home=await page.screenshot({type:'jpeg',quality:48});
 console.log('VISUAL_HOME='+home.toString('base64'));
 await page.getByRole('button',{name:'Plan'}).click();
 const cal=await page.screenshot({type:'jpeg',quality:48});
 console.log('VISUAL_CALENDAR='+cal.toString('base64'));
 await page.locator('[data-page="today"]').click();
 await page.getByRole('button',{name:/Open workout/}).click();
 const lift=await page.screenshot({type:'jpeg',quality:48});
 console.log('VISUAL_LIFT='+lift.toString('base64'));
 await page.close();
});
