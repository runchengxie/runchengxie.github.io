import assert from 'node:assert/strict';
import {installResearchFixtures} from './research-showcase-browser.mjs';
export async function verifyChartMotion({browser,origin}){
 for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:1440,height:700},reducedMotion:reduced?'reduce':'no-preference'});
  await installResearchFixtures(context);
  await context.addInitScript(()=>{
   window.chartCalls=[];window.chartRefs=[];
   const native=Element.prototype.animate;
   Element.prototype.animate=function(frames,options){
    const result=native.call(this,frames,options);
    if(this.classList.contains('research-bar')){window.chartCalls.push({origin:this.style.transformOrigin,frames,options});window.chartRefs.push(result);}
    return result;
   };
  });
  const page=await context.newPage();await page.goto(`${origin}/zh/projects/?researchStyle=momentum`);
  await page.waitForSelector('[data-study="market"][data-state="ready"]');
  await page.waitForSelector('[data-study="factor"][data-state="ready"]');
  assert.equal(await page.evaluate(()=>window.chartCalls.length),0,'offscreen charts remain static until an on-screen interaction');
  await page.locator('[data-study="market"] [data-research-chart]').scrollIntoViewIfNeeded();
  await page.locator('[data-study="market"] select').selectOption('value');
  const calls=await page.evaluate(()=>window.chartCalls);
  if(reduced)assert.equal(calls.length,0);
  else {
   assert(calls.length>0,'bar updates should have bounded native motion');
   assert(calls.some(call=>call.origin==='right center'),'negative bars reveal toward the left from zero');
   assert(calls.some(call=>call.origin==='left center'),'positive bars reveal toward the right from zero');
   for(const call of calls)assert(call.options.duration+call.options.delay<=200);
  }
  assert.match(await page.locator('[data-study="market"] [data-research-values]').textContent(),/-19%/);
  await page.evaluate(()=>{
   const select=document.querySelector('[data-study="factor"] select');
   for(const value of ['excessReturn','drawdown','informationRatio']){select.value=value;select.dispatchEvent(new Event('change'));}
  });
  assert.equal(await page.locator('[data-study="factor"] select').inputValue(),'informationRatio');
  assert.match(await page.locator('[data-study="factor"] [data-research-values]').textContent(),/0.5/);
  if(!reduced){
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>window.chartRefs.every(animation=>animation.playState!=='running'&&animation.playState!=='pending'),{},{timeout:1000});
  }
  await page.waitForTimeout(240);
  assert.equal(await page.locator('[data-research-chart]').evaluateAll(nodes=>nodes.reduce((sum,node)=>sum+node.getAnimations({subtree:true}).length,0)),0,'charts settle without perpetual animation');
  await context.close();
 }
}
