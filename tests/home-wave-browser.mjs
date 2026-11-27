import assert from 'node:assert/strict';
export async function verifyHomeWave({browser,origin}) {
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${origin}/en/`);
 const cover=await page.locator('#home-intro').boundingBox();
 assert(Math.abs(cover.x)<1&&Math.abs(cover.width-1440)<1);
 assert(Math.abs(cover.y+cover.height-900)<2);
 const canvas=page.locator('[data-home-wave]');
 const state=()=>canvas.evaluate(c=>{const gl=c.getContext('webgl'),p=gl.getParameter(gl.CURRENT_PROGRAM);return {time:gl.getUniform(p,gl.getUniformLocation(p,'uTime')),view:Array.from(gl.getUniform(p,gl.getUniformLocation(p,'uView'))),colour:Array.from(gl.getParameter(gl.COLOR_CLEAR_VALUE))};});
 await page.waitForFunction(()=>!document.querySelector('[data-wave-toggle]').hidden);
 const first=await state();await page.waitForTimeout(150);assert.notEqual((await state()).time,first.time);
 assert(await page.locator('.ef-pwave__hint').isVisible());
 await page.mouse.move(1100,600);await page.waitForTimeout(120);assert.notDeepEqual((await state()).view,first.view);
 await page.evaluate(()=>scrollTo(0,200));await page.waitForTimeout(200);
 assert.notEqual(await page.locator('.ef-pwave__fill').evaluate(e=>e.style.width),'0.00%');
 await page.evaluate(()=>scrollTo(0,0));await page.locator('[data-wave-toggle]').click();
 const paused=await state();await page.waitForTimeout(150);assert.equal((await state()).time,paused.time);
 await page.locator('#theme-toggle').click();assert.notDeepEqual((await state()).colour,paused.colour);
 await page.reload();assert.equal(await page.locator('[data-wave-toggle]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-wave-toggle]').click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-wave-toggle]').waitFor({state:'hidden'});
 const reduced=await state();await page.waitForTimeout(150);assert.equal((await state()).time,reduced.time);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${origin}/zh/`);assert.equal(await page.locator('.cover-enter').innerText(),'开始阅读 ↓');
 for(const width of [375,1440]){await page.setViewportSize({width,height:900});assert(await page.locator('.cover-enter').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);await context.close();
 for(const noJS of [false,true]){
  const fallback=await browser.newContext({javaScriptEnabled:!noJS});
  if(!noJS)await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
  const p=await fallback.newPage();await p.goto(`${origin}/en/`);assert(await p.locator('h1').isVisible());assert(await p.locator('.cover-enter').isVisible());await fallback.close();
 }
}
