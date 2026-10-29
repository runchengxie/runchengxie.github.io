import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, countMessage, localizedPath, localeFromPath } from '../src/i18n/index.ts';
import en from '../src/i18n/en.ts';
import zh from '../src/i18n/zh.ts';
test('switches locale prefixes without changing article identity', () => {
  assert.equal(localizedPath('zh','/en/blog/buffett-airline-investments/'), '/zh/blog/buffett-airline-investments/');
  assert.equal(localizedPath('en','/zh/projects/'), '/en/projects/');
  assert.equal(localizedPath('en'), '/en/');
  assert.equal(localeFromPath('/english/'), 'en');
  assert.equal(localeFromPath('/zh/blog/'), 'zh');
});
test('falls back to English for a missing Chinese message', () => {
  const original = zh['nav.home'];
  try {
    delete zh['nav.home'];
    assert.equal(t('zh','nav.home'),en['nav.home']);
  } finally { zh['nav.home']=original; }
});
test('interpolates named values and applies English and Chinese plural rules', () => {
  assert.equal(countMessage('en','blog.count',1),'1 article, newest first.');
  assert.equal(countMessage('en','blog.count',2),'2 articles, newest first.');
  assert.equal(countMessage('zh','blog.count',1),'共 1 篇，按时间倒序排列。');
  assert.equal(t('en','nav.homeLabel',{name:'Richard'}),'Richard home');
});
test('catalogs cover the same semantic keys and interpolation variables', () => {
  assert.deepEqual(Object.keys(en).sort(),Object.keys(zh).sort());
  for(const key of Object.keys(en)) {
    assert.deepEqual(en[key].match(/\{\w+\}/g),zh[key].match(/\{\w+\}/g),key);
  }
});
