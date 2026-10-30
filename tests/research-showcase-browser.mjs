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
    await factor.locator('select').selectOption('informationRatio');
    assert.match(await factor.locator('[data-research-values]').innerText(),/0\.5/);
    assert(!await factor.locator('[data-research-values]').innerText().then(text=>text.includes('%')));
    await factor.locator('select').selectOption('drawdown');
    assert.match(await factor.locator('[data-research-values]').innerText(),/40%/);
    const other=locale==='en'?'zh':'en';
    await page.locator(`[data-locale="${other}"]`).click();
    await page.waitForURL(url=>url.pathname===`/${other}/projects/`&&url.searchParams.get('researchStyle')==='value'&&url.searchParams.get('researchMetric')==='drawdown');
    await page.waitForSelector('[data-study="factor"][data-state="ready"]');
    assert.equal(await page.locator('[data-study="market"] select').inputValue(),'value');
    assert.equal(await page.locator('[data-study="factor"] select').inputValue(),'drawdown');
  }
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
