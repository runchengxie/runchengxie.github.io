import assert from 'node:assert/strict';
export async function verifyPageEntry({browser,origin}){
 const context=await browser.newContext({viewport:{width:1200,height:900}});
 await context.addInitScript(()=>{
  window.entryDocument=crypto.randomUUID();
  window.entries=[];
  document.addEventListener('animationstart',event=>{
   if(event.animationName!=='page-entry')return;
   const timing=event.target.getAnimations().find(animation=>animation.animationName==='page-entry')?.effect?.getTiming();
   window.entries.push({duration:timing?.duration,delay:timing?.delay});
  });
 });
 const page=await context.newPage();
 const check=async()=>{
  await page.waitForFunction(()=>window.entries.length>0);
  const entries=await page.evaluate(()=>window.entries);
  assert(entries.every(entry=>entry.duration===140 && entry.delay<=30));
  await page.waitForFunction(()=>!document.querySelector('[data-entry-active]'));
 };
 for(const path of ['en/blog/','zh/blog/','en/about/','zh/about/']){
  await page.goto(`${origin}/${path}`);await check();
  await page.reload();await check();
  await page.locator('[data-locale="'+(path.startsWith('en')?'zh':'en')+'"]').click();await check();
  const previous=await page.evaluate(()=>({id:window.entryDocument,count:window.entries.length}));
  await page.goto(`${origin}/en/projects/`);await page.goBack();
  await page.waitForFunction(prior=>window.entryDocument!==prior.id ? window.entries.length>0 : window.entries.length>prior.count,previous);
  await check();
  const before=await page.evaluate(()=>window.entries.length);
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await page.waitForFunction(count=>window.entries.length>count,before);
  await page.waitForFunction(()=>!document.querySelector('[data-entry-active]'));
 }
 await page.setViewportSize({width:1200,height:500});
 const background=page.locator('[data-about-background]');
 const signal=background.locator('.about-network__signal');
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 assert.equal(await background.getAttribute('aria-hidden'),'true');
 assert.equal(await background.evaluate(node=>getComputedStyle(node).pointerEvents),'none');
 assert.equal(await signal.evaluate(node=>getComputedStyle(node).animationPlayState),'running');
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='false');
 assert.equal(await signal.evaluate(node=>getComputedStyle(node).animationPlayState),'paused');
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await background.getAttribute('data-running'),'false');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='false');
 assert.equal(await signal.evaluate(node=>getComputedStyle(node).animationName),'none');
 assert.equal(await page.locator('canvas,video,audio').count(),0);
 await context.close();
 for(const options of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
  const fallback=await browser.newContext(options);const plain=await fallback.newPage();
  for(const path of ['zh/blog/','zh/about/']){
   await plain.goto(`${origin}/${path}`);
   assert.equal(await plain.locator('[data-entry-active]').count(),0);
   assert.equal(await plain.locator('h1').isVisible(),true);
   assert.equal(await plain.locator('[data-about-background][data-running="true"]').count(),0);
  }
  await fallback.close();
 }
}
