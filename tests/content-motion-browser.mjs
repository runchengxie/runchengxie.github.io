import assert from 'node:assert/strict';

export async function verifyContentMotion({browser,origin}) {
 const context=await browser.newContext({viewport:{width:1200,height:600}});
 await context.addInitScript(()=>{
  window.contentMotionEvents=[];
  document.addEventListener('animationstart',event=>{
   if(event.animationName!=='content-reveal')return;
   const effect=event.target.getAnimations().find(animation=>animation.animationName===event.animationName)?.effect;
   window.contentMotionEvents.push({kind:event.target.dataset.motionKind,index:[...document.querySelectorAll('.post-list__item')].indexOf(event.target),...effect?.getTiming()});
  });
 });
 const page=await context.newPage();await page.goto(`${origin}/en/blog/`);
 const rows=page.locator('[data-motion-archive] .post-list__item');
 assert.equal(await rows.count(),15,'complete archive is server rendered');
 await page.waitForFunction(()=>!document.querySelector('[data-entry-active]'));
 assert.equal(await rows.first().evaluate(node=>node.getAnimations().length),0,'entry settles before scroll reveals');
 await rows.nth(5).scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>window.contentMotionEvents.some(event=>event.kind==='blog'));
 await page.waitForTimeout(280);
 const events=await page.evaluate(()=>window.contentMotionEvents);
 for(const event of events){assert.equal(event.duration,200);assert(event.delay<=24);}
 const observed=events.find(event=>event.kind==='blog').index;
 await page.evaluate(()=>scrollTo(0,0));await rows.nth(observed).scrollIntoViewIfNeeded();await page.waitForTimeout(280);
 assert.equal(await page.evaluate(index=>window.contentMotionEvents.filter(event=>event.index===index).length,observed),1,'archive row reveals once');
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
 await rows.last().locator('h2 a').focus();
 assert.equal(await rows.last().evaluate(node=>node.getAnimations().length),0,'focus settles motion immediately, including pending entries');
 await page.waitForTimeout(280);
 assert.equal(await rows.last().evaluate(node=>node.getAnimations().length),0);
 const position=await page.evaluate(()=>scrollY);await page.waitForTimeout(120);
 assert.equal(await page.evaluate(()=>scrollY),position,'motion does not adjust scrolling');
 await page.goto(`${origin}/en/about/`);
 await page.locator('.about-content section').last().scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>window.contentMotionEvents.some(event=>event.kind==='about'));
 const aboutEvents=await page.evaluate(()=>window.contentMotionEvents.filter(event=>event.kind==='about'));
 assert(aboutEvents.every(event=>event.duration===360),'about has the slower quiet profile');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelectorAll('[data-reveal="play"]').length===0,{},{timeout:1000});
 await context.close();
 for(const mode of ['reduced','no-js']){
  const fallback=await browser.newContext({javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  const plain=await fallback.newPage();await plain.goto(`${origin}/en/blog/`);
  assert.equal(await plain.locator('.post-list__item').count(),15);
  assert(await plain.locator('.post-list__item').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==='1' && getComputedStyle(node).visibility==='visible')));
  await plain.locator('.post-list__item').last().scrollIntoViewIfNeeded();
  assert.equal(await plain.locator('[data-reveal="play"]').count(),0);
  await plain.goto(`${origin}/en/about/`);
  assert(await plain.locator('.about-content section').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==='1')));
  await fallback.close();
 }
}
