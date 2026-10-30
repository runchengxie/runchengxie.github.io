import assert from 'node:assert/strict';
export async function verifyMotion({browser,origin}) {
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 await context.addInitScript(()=>{
  window.motionEvents=[];
  document.addEventListener('animationstart',event=>{
   const effect=event.target.getAnimations().find(animation=>animation.animationName===event.animationName)?.effect;
   window.motionEvents.push({name:event.animationName,timing:effect?.getTiming()});
  });
 });
 const page=await context.newPage();
 await page.goto(`${origin}/en/`);
 assert.equal(await page.locator('[data-home-cover] .cover-tile').count(),6);
 assert.equal(await page.locator('.intro-title-line').count(),2);
 assert.equal(await page.locator('.intro-frame[aria-hidden="true"]').count(),1);
 assert.equal(await page.locator('audio,video').count(),0);
 await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-home-motion'));
 const events=await page.evaluate(()=>window.motionEvents);
 const titles=events.filter(event=>event.name==='home-heading-in');assert.equal(titles.length,2);
 assert(titles.every(event=>Number(event.timing.duration)+Number(event.timing.delay)<=200));
 const frame=events.find(event=>event.name==='intro-frame-in');assert(frame && Number(frame.timing.duration)<=360);
 assert.equal(events.filter(event=>event.name==='cover-tile-out').length,6,'first visit should animate the six local tiles');
 for(const event of events.filter(event=>event.name==='cover-tile-out'))assert(Number(event.timing.duration)+Number(event.timing.delay)<=180);
 assert.equal(await page.locator('[data-home-cover]').evaluate(node=>getComputedStyle(node).pointerEvents),'none');
 await page.goto(`${origin}/zh/`);
 const seen=await page.evaluate(()=>window.motionEvents.filter(event=>event.name==='cover-tile-out').length);
 assert.equal(seen,0,'language switch must not replay cover');
 const last=page.locator('#latest-heading').locator('..').locator('..');
 await last.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.home-latest')?.getAttribute('data-revealed')==='true');
 await page.waitForTimeout(200);
 assert.equal(await last.evaluate(node=>node.getAnimations().length),0,'reveal must settle');
 const count=await page.evaluate(()=>window.motionEvents.filter(event=>event.name==='section-reveal').length);
 await page.evaluate(()=>scrollTo(0,0));await last.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>window.motionEvents.filter(event=>event.name==='section-reveal').length),count,'scroll reveal plays once');
 await page.reload();await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>window.motionEvents.filter(event=>event.name==='cover-tile-out').length),0);
 await page.goto(`${origin}/zh/about/`);await page.goBack();
 assert.equal(await page.locator('[data-home-cover]').isVisible(),false);
 await context.close();
 for(const reduced of [true,false]){
  const fallback=await browser.newContext({reducedMotion:reduced?'reduce':'no-preference',javaScriptEnabled:reduced});
  const plain=await fallback.newPage();await plain.goto(`${origin}/en/`);
  assert.equal(await plain.locator('[data-home-cover]').isVisible(),false);
  assert.equal(await plain.locator('h1').isVisible(),true);
  assert.equal(await plain.evaluate(()=>document.querySelector('h1').getAnimations().length),0);
  await fallback.close();
 }
 const blocked=await browser.newContext();
 await blocked.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked');}}));
 const restricted=await blocked.newPage();await restricted.goto(`${origin}/zh/`);
 assert.equal(await restricted.locator('[data-home-cover]').isVisible(),false);
 await blocked.close();
 const focusContext=await browser.newContext({viewport:{width:1440,height:900}});
 await focusContext.addInitScript(()=>sessionStorage.setItem('personal-site-home-motion-v2','true'));
 const focused=await focusContext.newPage();await focused.goto(`${origin}/en/`);
 await focused.locator('.home-latest a').first().focus();await focused.waitForTimeout(180);
 assert.equal(await focused.locator('.home-latest').evaluate(node=>node.getAnimations().length),0,'keyboard focus settles a reveal immediately');
 await focusContext.close();
 const unsupported=await browser.newContext();
 await unsupported.addInitScript(()=>{delete window.IntersectionObserver;});
 const fallbackPage=await unsupported.newPage();await fallbackPage.goto(`${origin}/en/`);
 assert.equal(await fallbackPage.locator('h1').isVisible(),true);await unsupported.close();
 const hash=await browser.newContext();const linked=await hash.newPage();await linked.goto(`${origin}/en/#latest-heading`);
 assert.equal(await linked.locator('[data-home-cover]').isVisible(),false);await hash.close();
}
