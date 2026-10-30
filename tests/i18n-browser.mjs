import {verifyPageEntry} from './page-entry-browser.mjs';
import {verifyHomeEntry} from './home-entry-browser.mjs';
import {verifyChartMotion} from './chart-motion-browser.mjs';
import {verifyContentMotion} from './content-motion-browser.mjs';
import {verifyMotion} from './motion-browser.mjs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {installResearchFixtures,verifyResearchShowcase} from './research-showcase-browser.mjs';

const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.xml':'application/xml'};
const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'}).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  await verifyPageEntry({browser,origin});
  await verifyHomeEntry({browser,origin});
  await verifyChartMotion({browser,origin});
  await verifyContentMotion({browser,origin});
  await verifyMotion({browser,origin});
  const context = await browser.newContext({colorScheme:'light'});
  await installResearchFixtures(context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.waitForURL(`${origin}/en/`);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    for (const locale of ['en','zh']) for (const theme of ['light','dark']) {
      await page.evaluate(value => localStorage.setItem('theme',value),theme);
      for(const route of ['', 'projects/','about/','blog/','notes/investment-perspective/','404/','blog/buffett-airline-investments/']) {
        const response = await page.goto(`${origin}/${locale}/${route}`);
        assert.equal(response.status(),200);
        if(route==='projects/') {
          await page.waitForSelector('[data-study="market"][data-state="ready"]');
          await page.waitForSelector('[data-study="factor"][data-state="ready"]');
        }
        assert.equal(await page.locator('html').getAttribute('lang'),locale === 'zh' ? 'zh-CN':'en');
        assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
        assert.equal(await page.locator('h1').count(),1);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), `${locale} ${width} ${route} overflows`);
        if(locale==='en') assert(!/\p{Script=Han}/u.test(await page.locator('main').innerText()),`Chinese prose on English page ${route}`);
      }
    }
  }
  await page.goto(`${origin}/en/projects/`);
  await page.locator('.project-navigation a[href="#group-2"]').click();
  await page.locator('[data-locale="zh"]').click();
  await page.waitForURL(`${origin}/zh/projects/#group-2`, {timeout: 3000});
  await page.goto(`${origin}/en/projects/?from=test#group-1`);
  await page.locator('[data-locale="zh"]').click();
  await page.waitForURL(`${origin}/zh/projects/?from=test#group-1`);
  assert.equal(await page.evaluate(()=>localStorage.getItem('site-locale')),'zh');
  await page.goto(origin);
  await page.waitForURL(`${origin}/zh/`);
  await page.goto(`${origin}/en/`); // An explicit language URL wins over saved preference.
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.evaluate(()=>localStorage.setItem('site-locale','not-a-locale'));
  await page.goto(origin);
  await page.waitForURL(`${origin}/en/`);
  await page.goto(`${origin}/en/blog/buffett-airline-investments/`);
  await page.locator('[data-locale="zh"]').click();
  await page.waitForURL(`${origin}/zh/blog/buffett-airline-investments/`);
  await page.locator('[data-locale="en"]').click();
  await page.waitForURL(`${origin}/en/blog/buffett-airline-investments/`);
  const before=await page.locator('html').getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  await page.reload();
  assert.notEqual(await page.locator('html').getAttribute('data-theme'),before);
  await page.goto(`${origin}/blog/buffett-airline-investments/?source=old#content`);
  await page.waitForURL(`${origin}/zh/blog/buffett-airline-investments/?source=old#content`);
  for (const locale of ['en','zh']) {
    await page.goto(`${origin}/${locale}/blog/`);
    assert.equal(await page.locator('.post-list__item').count(),15);
    const articleLinks=await page.locator('.post-list__item h2 a').evaluateAll(links=>links.map(link=>link.href));
    for(const href of articleLinks) {
      await page.goto(href);
      assert.equal(await page.locator('.translation-notice').count(),0);
      assert((await page.locator('.prose').innerText()).length > 300);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), href.replace(origin,'https://runchengxie.github.io'));
    }
  }
  await verifyResearchShowcase({page,context,origin});
  // The page is usable when storage is blocked by the browser.
  const restricted=await browser.newContext();
  await restricted.addInitScript(()=>{
    Storage.prototype.getItem=()=>{throw new Error('Storage blocked');};
    Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};
  });
  const restrictedPage=await restricted.newPage();
  restrictedPage.on('pageerror',error=>errors.push(error.message));
  await restrictedPage.goto(origin);
  await restrictedPage.waitForURL(`${origin}/en/`);
  await restrictedPage.locator('[data-locale="zh"]').click();
  await restrictedPage.waitForURL(`${origin}/zh/`);
  await restrictedPage.locator('#theme-toggle').click();
  assert.equal(await restrictedPage.locator('html').getAttribute('data-theme'),'dark');
  await restricted.close();
  // Explicit locale links work even with JavaScript disabled.
  const noJS=await browser.newContext({javaScriptEnabled:false});
  const plain=await noJS.newPage();
  await plain.goto(`${origin}/en/about/`);
  await plain.locator('[data-locale="zh"]').click();
  await plain.waitForURL(`${origin}/zh/about/`);
  await plain.goto(`${origin}/en/projects/`);
  assert.equal(await plain.locator('[data-research-showcase] select:disabled').count(),2);
  assert.equal(await plain.locator('[data-study-link]').count(),2);
  assert.equal(await plain.locator('noscript').last().isVisible(),true);
  await plain.goto(origin);
  await plain.waitForURL(`${origin}/en/`);
  await noJS.close();
  if(process.env.SCREENSHOT_DIR) {
    const {mkdir}=await import('node:fs/promises');
    await mkdir(process.env.SCREENSHOT_DIR,{recursive:true});
    for(const locale of ['en','zh']) for(const width of [390,1440]) {
      await page.setViewportSize({width,height:1000});
      await page.goto(`${origin}/${locale}/`);
      await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${locale}-${width}.png`),fullPage:true});
      await page.goto(`${origin}/${locale}/projects/`);
      await page.waitForSelector('[data-study="factor"][data-state="ready"]');
      await page.locator('[data-research-showcase]').screenshot({path:path.join(process.env.SCREENSHOT_DIR,`research-${locale}-${width}.png`)});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 112 locale/viewport/theme combinations, 30 complete articles, language and theme persistence, query/hash preservation, legacy URLs, blocked storage, JavaScript-disabled navigation, source-backed research comparisons, and native cover/chart/blog/about motion.');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
