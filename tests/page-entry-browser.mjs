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
 const track=background.locator('.about-candles__track');
 assert.equal(await background.locator('defs .about-candle').count(),20);
 assert.equal(await track.locator('use').count(),2);
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 assert.equal(await background.getAttribute('aria-hidden'),'true');
 assert.equal(await background.evaluate(node=>getComputedStyle(node).pointerEvents),'none');
 assert.equal(await track.evaluate(node=>getComputedStyle(node).animationPlayState),'running');
 const loop=await track.evaluate(node=>{
  const animation=node.getAnimations()[0];
  const timing=animation.effect.getTiming();
  animation.pause();animation.currentTime=0;
  const first=node.querySelector('use').getBoundingClientRect();
  animation.currentTime=Number(timing.duration)-1;
  const second=node.querySelectorAll('use')[1].getBoundingClientRect();
  animation.play();
  return {duration:timing.duration,continuous:timing.iterations===Infinity,error:Math.abs(first.x-second.x),keys:animation.effect.getKeyframes().flatMap(frame=>Object.keys(frame)).filter(key=>!['offset','computedOffset','easing','composite'].includes(key))};
 });
 assert.equal(loop.duration,64000);assert(loop.continuous);assert(loop.error<.1,'duplicate sequence meets the next cycle');
 assert(loop.keys.every(key=>key==='transform'),'loop only moves the track');

 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='false');
 assert.equal(await track.evaluate(node=>getComputedStyle(node).animationPlayState),'paused');
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await background.getAttribute('data-running'),'false');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='true');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('[data-about-background]').dataset.running==='false');
 assert.equal(await track.evaluate(node=>getComputedStyle(node).animationName),'none');
 assert.equal(await page.locator('canvas,video,audio').count(),0);
 await context.close();
 const layout=await browser.newContext({viewport:{width:1440,height:900}});
 const composed=await layout.newPage();
 for(const width of [320,768,1024,1088,1200,1440])for(const locale of ['en','zh']){
  await composed.setViewportSize({width,height:900});await composed.goto(`${origin}/${locale}/about/`);
  await composed.waitForFunction(()=>!document.querySelector('[data-entry-active]'));
  const bounds=await composed.evaluate(()=>{
   const chart=document.querySelector('[data-about-background]').getBoundingClientRect();
   const copy=document.querySelector('.about-heading__copy').getBoundingClientRect();
   const eyebrow=document.querySelector('.about-heading .eyebrow').getBoundingClientRect();
   return {rightClearance:chart.left-copy.right,topClearance:eyebrow.top-chart.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!bounds.overflow,`${locale}/${width} horizontal overflow`);
  assert(width>=1088?bounds.rightClearance>=31:bounds.topClearance>=0,`${locale}/${width} chart overlaps text`);
 }
 await layout.close();
 for(const options of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
  const fallback=await browser.newContext(options);const plain=await fallback.newPage();
  for(const path of ['zh/blog/','zh/about/']){
   await plain.goto(`${origin}/${path}`);
   assert.equal(await plain.locator('[data-entry-active]').count(),0);
   assert.equal(await plain.locator('h1').isVisible(),true);
   if(path.includes('about'))assert.equal(await plain.locator('.about-candles__track').evaluate(node=>node.getAnimations().length),0);
   assert.equal(await plain.locator('[data-about-background][data-running="true"]').count(),0);
  }
  await fallback.close();
 }
}
