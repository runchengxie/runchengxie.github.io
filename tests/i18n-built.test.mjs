import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
const html = (route) => {
  const file = `dist/${route ? `${route}/` : ''}index.html`;
  assert.ok(existsSync(file), `Missing localized page: ${file}`);
  return readFileSync(file, 'utf8');
};
const sourceFiles = readdirSync('src/content/blog').filter(f => f.endsWith('.md'));
const frontmatter = (source) => parse(source.match(/^---\s*\n([\s\S]*?)\n---/)[1]);
test('both locales publish complete main pages with matching alternate links', () => {
  for (const locale of ['en','zh']) for(const route of ['', 'projects','about','blog','notes/investment-perspective']) {
    const page = html(`${locale}${route ? `/${route}` : ''}`);
    assert.match(page, new RegExp(`<html[^>]+lang="${locale === 'zh' ? 'zh-CN' : 'en'}"`));
    for(const target of ['en','zh']) assert.ok(page.includes(`https://runchengxie.github.io/${target}/${route ? `${route}/` : ''}`));
    assert.ok(page.includes('hreflang="x-default"'));
  }
});
test('all articles have complete English counterparts with stable identities, dates and source links', () => {
  for(const file of sourceFiles) {
    const source = readFileSync(`src/content/blog/${file}`, 'utf8');
    assert.ok(existsSync(`src/content/blog-en/${file}`), `Missing English translation: ${file}`);
    const translation = readFileSync(`src/content/blog-en/${file}`, 'utf8');
    assert.equal(String(frontmatter(source).date), String(frontmatter(translation).date));
    for(const url of source.matchAll(/https?:\/\/[^\s)>]+/g)) assert.ok(translation.includes(url[0]), `Missing source link ${file}: ${url[0]}`);
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    for(const locale of ['en','zh']) {
      const page=html(`${locale}/blog/${slug}`);
      assert.ok(page.includes(`/${locale}/blog/`));
      assert.ok(page.includes(`hreflang="${locale === 'zh' ? 'en' : 'zh-CN'}"`));
    }
  }
});
test('English interface and Chinese interface use their own text and feeds', () => {
  assert.match(html('en'), /Research markets/);
  assert.match(html('zh'), /研究市场/);
  assert.match(html('en/projects'), /Data and backtesting/);
  assert.match(html('zh/projects'), /数据与回测/);
  for(const locale of ['en','zh']) {
    const feed=readFileSync(`dist/${locale}/rss.xml`,'utf8');
    assert.ok(feed.includes(`<language>${locale === 'zh' ? 'zh-CN' : 'en'}</language>`));
    assert.equal((feed.match(/<item>/g)||[]).length,sourceFiles.length);
    assert.ok(feed.includes(`/${locale}/blog/`));
  }
});
test('root defaults to English and old Chinese paths remain available', () => {
  assert.match(html(''), /\/en\//);
  for(const path of ['about','projects','blog','notes/investment-perspective']) assert.ok(html(path).includes(`/zh/${path}/`));
});
