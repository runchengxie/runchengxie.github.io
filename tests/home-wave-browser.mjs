import assert from 'node:assert/strict';

export async function verifyHomeWave({browser, origin}) {
 const context = await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
 const page = await context.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 await page.goto(`${origin}/en/`);
 const canvas = page.locator('[data-home-wave] canvas');
 await canvas.waitFor();
 const pixels = () => canvas.evaluate(node => node.toDataURL());
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'true');
 await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', {persisted:true})));
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'false');
 const history = await pixels();await page.waitForTimeout(100);assert.equal(await pixels(),history);
 await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true})));
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'true');
 await page.evaluate(() => {Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('[data-home-wave]').getAttribute('data-running'),'false');
 const hidden = await pixels();await page.waitForTimeout(100);assert.equal(await pixels(),hidden);
 await page.evaluate(() => {delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'true');
 const moving = await pixels(); await page.waitForTimeout(150); assert.notEqual(await pixels(),moving);
 await page.locator('[data-wave-toggle]').click();
 assert.equal(await page.locator('[data-wave-toggle]').getAttribute('aria-pressed'),'true');
 const paused = await pixels(); await page.waitForTimeout(150); assert.equal(await pixels(),paused);
 await page.locator('#theme-toggle').click();
 await page.waitForTimeout(50); assert.notEqual(await pixels(),paused,'static wave follows theme');
 await page.reload();
 await page.waitForFunction(() => document.querySelector('[data-wave-toggle]').getAttribute('aria-pressed') === 'true');
 const saved = await pixels(); await page.waitForTimeout(150); assert.equal(await pixels(),saved);
 await page.locator('[data-wave-toggle]').click();
 await page.locator('.home-latest').scrollIntoViewIfNeeded();
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'false');
 const offscreen = await pixels(); await page.waitForTimeout(150); assert.equal(await pixels(),offscreen);
 await page.evaluate(() => scrollTo(0,0));
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'true');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 // Resolve style after CDP media emulation before awaiting its queued change event.
 await page.locator('[data-wave-toggle]').waitFor({state:'hidden'});
 await page.waitForFunction(() => document.querySelector('[data-home-wave]').dataset.running === 'false');
 assert.equal(await page.locator('[data-wave-toggle]').isVisible(),false);
 const reduced = await pixels();await page.waitForTimeout(150);assert.equal(await pixels(),reduced);
 await page.locator('#theme-toggle').click();await page.waitForTimeout(50);assert.notEqual(await pixels(),reduced);
 await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(() => {
  const canvas = document.querySelector('[data-home-wave] canvas');
  return canvas.width === Math.round(canvas.getBoundingClientRect().width * Math.min(devicePixelRatio || 1,1.5));
 });
 const dimensions = await canvas.evaluate(node => ({actual:node.width,css:node.getBoundingClientRect().width}));
 assert(dimensions.actual <= Math.ceil(dimensions.css*1.5));
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth>innerWidth),false);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.waitForFunction(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
 await page.locator('[data-wave-toggle]').waitFor({state:'visible'});
 await page.goto(`${origin}/zh/`);
 assert.equal(await page.locator('[data-wave-toggle]').innerText(),'暂停背景动画');
 assert.deepEqual(errors,[]);
 await context.close();

 for (const disable of ['canvas','observer','storage']) {
  const fallback = await browser.newContext();
  await fallback.addInitScript(disable => {
   if(disable==='canvas') HTMLCanvasElement.prototype.getContext=()=>null;
   if(disable==='observer') delete window.IntersectionObserver;
   if(disable==='storage') Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});
  },disable);
  const plain = await fallback.newPage(); const failures=[];plain.on('pageerror',e=>failures.push(e.message));
  await plain.goto(`${origin}/en/`);
  assert(await plain.locator('h1').isVisible());
  if(disable==='canvas') assert.equal(await plain.locator('[data-wave-toggle]').isVisible(),false);
  if(disable==='observer') assert.equal(await plain.locator('[data-home-wave]').getAttribute('data-running'),'false');
  assert.deepEqual(failures,[]);await fallback.close();
 }
}
