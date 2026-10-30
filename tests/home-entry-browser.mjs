import assert from 'node:assert/strict';
const record=()=>{
 window.entryStarts=[];
 document.addEventListener('animationstart',event=>{if(event.animationName==='intro-frame-in')window.entryStarts.push(performance.now());});
};
export async function verifyHomeEntry({browser,origin}){
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 await context.addInitScript(record);
 await context.addInitScript(()=>{
  sessionStorage.setItem('personal-site-home-motion-v1','true');
  sessionStorage.setItem('personal-site-home-motion-v2','true');
 });
 const page=await context.newPage();
 const settled=async()=>{
  await page.waitForFunction(()=>window.entryStarts.length>=1);
  await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-home-motion'));
 };
 await page.goto(`${origin}/en/`);await settled();
 assert.equal(await page.locator('[data-home-replay],.home-entry-controls').count(),0);
 await page.reload();await settled();
 await page.locator('[data-locale="zh"]').click();await settled();
 await page.goto(`${origin}/zh/about/`);await page.goBack();await settled();
 // Exercise the persisted-document path even on browsers that disable bfcache in tests.
 const before=await page.evaluate(()=>window.entryStarts.length);
 await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await page.waitForFunction(count=>window.entryStarts.length===count+1,before);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-home-motion'));
 await context.close();
 const slow=await browser.newContext();await slow.addInitScript(record);
 await slow.route('**/*.css',async route=>{await new Promise(resolve=>setTimeout(resolve,900));await route.continue();});
 const delayed=await slow.newPage();await delayed.goto(`${origin}/en/`);
 await delayed.waitForFunction(()=>window.entryStarts.length===1);await slow.close();
 const blocked=await browser.newContext();await blocked.addInitScript(record);
 await blocked.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked');}}));
 const restricted=await blocked.newPage();await restricted.goto(`${origin}/zh/`);
 await restricted.waitForFunction(()=>window.entryStarts.length===1);await blocked.close();
 for(const options of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
  const fallback=await browser.newContext(options);const plain=await fallback.newPage();await plain.goto(`${origin}/zh/`);
  assert.equal(await plain.locator('[data-home-cover]').isVisible(),false);
  assert.equal(await plain.locator('h1').isVisible(),true);
  assert.equal(await plain.locator('[data-home-replay]').count(),0);await fallback.close();
 }
}
