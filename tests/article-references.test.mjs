import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const files=readdirSync('src/content/blog').filter(file=>file.endsWith('.md'));
const urls=text=>[...new Set([...text.matchAll(/https?:\/\/[^\s)>]+/g)].map(match=>match[0]))].sort();
test('every article has linked references in both languages',()=>{
 for(const file of files) for(const [directory,label] of [['blog','参考文献|参考资料'],['blog-en','References']]) {
  const text=readFileSync(`src/content/${directory}/${file}`,'utf8');
  const headings=[...text.matchAll(new RegExp(`^## (?:\\d+\\. )?(?:${label})\\s*$`,'gmi'))];
  assert.equal(headings.length,1,`${directory}/${file}: expected one reference section`);
  const references=text.slice(headings[0].index);
  assert.match(references,/\[[^\]]+\]\(<?https?:\/\/[^)>]+>?\)/,`${directory}/${file}: reference list needs source links`);
 }
});
test('Chinese and English versions cite the same external source destinations',()=>{
 for(const file of files) {
  assert.deepEqual(urls(readFileSync(`src/content/blog/${file}`,'utf8')),urls(readFileSync(`src/content/blog-en/${file}`,'utf8')),file);
 }
});
