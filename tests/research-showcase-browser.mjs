import assert from 'node:assert/strict';
import {marketFixture,factorFixture} from './research-showcase-fixtures.mjs';
import {researchSources} from '../src/lib/research-showcase.ts';
export async function installResearchFixtures(context) {
  await context.route(researchSources.market,route=>route.fulfill({json:marketFixture(),headers:{'access-control-allow-origin':'*'}}));
  await context.route(researchSources.factor,route=>route.fulfill({json:factorFixture(),headers:{'access-control-allow-origin':'*'}}));
}
export async function verifyResearchShowcase({page,context,origin}) {
  for(const locale of ['en','zh']) {
    await page.goto(`${origin}/${locale}/projects/`);
    const market=page.locator('[data-study="market"]'),factor=page.locator('[data-study="factor"]');
    await page.waitForSelector('[data-study="market"][data-state="ready"]');
    await page.waitForSelector('[data-study="factor"][data-state="ready"]');
    assert.equal(await page.locator('[data-project-demos]').count(),0);
    assert.equal(await page.locator('[data-clean], [data-rebalance-form]').count(),0);
    assert.equal(await market.locator('[data-research-values] tr').count(),3);
    assert.equal(await factor.locator('[data-research-values] tr').count(),5);
    assert.match(await market.locator('[data-research-values]').textContent(),/-20%/);
    assert.match(await market.locator('[data-research-values]').textContent(),/2008/);
    assert.equal(await market.locator('option').count(),19);
    assert.equal(await market.locator('[data-research-chart]').textContent().then(value=>value.includes('2009')),false);
    assert.match(await market.locator('[data-research-chart]').innerText(),/2008 \*/);
    await market.locator('select').selectOption('value');
    assert.match(await market.locator('[data-research-values]').textContent(),/-19%/);
    assert.match(await market.locator('[data-research-values]').textContent(),/11%/);
    assert.match(await market.locator('[data-research-reading]').innerText(),/2/);
    assert.match(await factor.locator('[data-research-reading]').innerText(),/-2/);
    await factor.locator('select').selectOption('informationRatio');
    assert.match(await factor.locator('[data-research-values]').textContent(),/0\.5/);
    assert(!await factor.locator('[data-research-values]').textContent().then(text=>text.includes('%')));
    assert.match(await factor.locator('[data-research-reading]').innerText(),/-0\.2/);
    assert(!await factor.locator('[data-research-reading]').innerText().then(text=>text.includes('percentage points')||text.includes('百分点')));
    await factor.locator('select').selectOption('drawdown');
    assert.match(await factor.locator('[data-research-values]').textContent(),/40%/);
    const other=locale==='en'?'zh':'en';
    await page.locator(`[data-locale="${other}"]`).click();
    await page.waitForURL(url=>url.pathname===`/${other}/projects/`&&url.searchParams.get('researchStyle')==='value'&&url.searchParams.get('researchMetric')==='drawdown');
    await page.waitForSelector('[data-study="factor"][data-state="ready"]');
    assert.equal(await page.locator('[data-study="market"] select').inputValue(),'value');
    assert.equal(await page.locator('[data-study="factor"] select').inputValue(),'drawdown');
  }
  // A long source history remains available behind a compact six-period preview.
  const long=marketFixture();
  long.factors[0].annual=Array.from({length:12},(_,index)=>({year:2015+index,periodStart:`${2015+index}-01-05`,periodEnd:index===11?'2026-09-04':`${2015+index}-12-31`,days:200,partial:index===11,value:index-5}));
  await context.route(researchSources.market,route=>route.fulfill({json:long,headers:{'access-control-allow-origin':'*'}}));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${origin}/zh/projects/`);
  await page.waitForSelector('[data-study="market"][data-state="ready"]');
  await page.waitForSelector('[data-study="factor"][data-state="ready"]');
  const preview=page.locator('[data-study="market"]');
  assert.equal(await preview.locator('.research-chart-row').count(),6);
  assert.equal(await preview.locator('[data-research-values] tr').count(),12);
  assert.equal(await preview.locator('.research-values').getAttribute('open'),null);
  assert.match(await preview.locator('[data-research-window]').innerText(),/2021/);
  assert.match(await preview.locator('[data-research-reading]').innerText(),/12/);
  const first=await preview.boundingBox(),second=await page.locator('[data-study="factor"]').boundingBox();
  assert(second.x>first.x && Math.abs(second.y-first.y)<2,'desktop studies should share a row');
  assert(first.height<1250 && second.height<1250,'collapsed cards should stay compact');
  await preview.locator('[data-research-years]').click();
  assert.equal(await preview.locator('.research-chart-row').count(),12);
  assert.equal(await preview.locator('[data-research-years]').getAttribute('aria-expanded'),'true');
  await preview.locator('[data-research-years]').click();
  assert.equal(await preview.locator('.research-chart-row').count(),6);
  await context.unroute(researchSources.market);await installResearchFixtures(context);
  // A source failure does not block the other panel or leave fabricated/stale results.
  let fail=true;
  await context.route(researchSources.market,route=>route.fulfill({status:fail?503:200,json:fail?{}:marketFixture(),headers:{'access-control-allow-origin':'*'}}));
  await page.goto(`${origin}/en/projects/`);
  await page.waitForSelector('[data-study="market"][data-state="error"]');
  await page.waitForSelector('[data-study="factor"][data-state="ready"]');
  assert.equal(await page.locator('[data-study="market"] [data-research-result]').isVisible(),false);
  assert.equal(await page.locator('[data-study="market"] [data-study-link]').isVisible(),true);
  fail=false;
  await page.locator('[data-study="market"] [data-research-retry]').click();
  await page.waitForSelector('[data-study="market"][data-state="ready"]');
  await context.route(researchSources.factor,route=>route.fulfill({json:{...factorFixture(),schema_version:2},headers:{'access-control-allow-origin':'*'}}));
  await page.goto(`${origin}/zh/projects/?researchControl=size_lowvol&researchStyle=unknown&researchMetric=unknown`);
  await page.waitForSelector('[data-study="factor"][data-state="error"]');
  assert.equal(await page.locator('[data-study="factor"] [data-research-result]').isVisible(),false);
  assert.equal(await page.locator('[data-study="market"] select').inputValue(),'size');
  assert.equal(await page.locator('[data-study="factor"] select').inputValue(),'annualReturn');
  await context.unroute(researchSources.market);
  await context.unroute(researchSources.factor);
  await installResearchFixtures(context);
}
