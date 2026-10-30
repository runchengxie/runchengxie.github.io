import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {marketFixture,factorFixture} from './research-showcase-fixtures.mjs';
const load=async()=>{assert.ok(existsSync('src/lib/research-showcase.ts'),'Research-source parser is not implemented');return import('../src/lib/research-showcase.ts');};
test('projects reviewed low-turnover rows without changing units or exposing extra fields',async()=>{
 const {parseMarketEvidence}=await load();const input=marketFixture();input.private_detail='not for display';
 const data=parseMarketEvidence(input);assert.equal(data.months,86);assert.equal(data.controls[0].spread,1);assert.equal(data.controls[2].high,-.2);assert.equal('private_detail' in data,false);
});
test('rejects market schema/unit drift, duplicate controls, invalid intervals and inconsistent spreads',async()=>{
 const {parseMarketEvidence}=await load();
 for(const mutate of [x=>x.unit='percent',x=>x.rankingMode='old',x=>x.schemaVersion=2,x=>x.controls[0].spread=9,x=>x.controls[0].ciLow=2,x=>x.controls[0].high=NaN,x=>x.controls[1].id='raw',x=>x.months=0,x=>x.reviewedAt='2026-02-30',x=>x.manifestSha256='invalid',x=>x.firstReturnEnd='2018-01-01']){
  const value=marketFixture();mutate(value);assert.throws(()=>parseMarketEvidence(value));
 }
});
test('reads PB/ROE percentages as fractions and leaves information ratio unitless',async()=>{
 const {parseFactorEvidence}=await load();const value=factorFixture();value.studies[0].private_detail='excluded';
 const data=parseFactorEvidence(value);assert.equal(data.rows.length,5);assert.equal(data.rows[0].annualReturn,.1);assert.equal(data.rows[0].drawdown,.4);assert.equal(data.rows[0].informationRatio,.5);assert.equal(data.rows[0].id,'pb');assert.equal('private_detail' in data,false);
});
test('rejects unreviewed factor data, unknown/duplicate rankings and invalid metric values',async()=>{
 const {parseFactorEvidence}=await load();
 for(const mutate of [x=>delete x.studies[0].columns,x=>x.studies[0].columns.reverse(),x=>x.schema_version=2,x=>x.studies[0].status='preliminary',x=>x.studies[0].evidence_stage='demo',x=>x.studies[0].source_review_status.status='unmatched',x=>x.studies[0].rows[0][1]='10',x=>x.studies[0].rows[0][3]='-40%',x=>x.studies[0].rows[0][4]='NaN',x=>x.studies[0].rows[1][0]='仅用 PB',x=>x.studies[0].rows.pop(),x=>x.studies[0].period='invalid']){
  const value=factorFixture();mutate(value);assert.throws(()=>parseFactorEvidence(value));
 }
});
test('chart domains include zero and all bounds, with a usable domain for all-zero values',async()=>{
 const {chartDomain}=await load();assert.deepEqual(chartDomain([-2,1,3]),[-2,3]);assert.deepEqual(chartDomain([1,2]),[0,2]);assert.deepEqual(chartDomain([0,0]),[0,1]);assert.throws(()=>chartDomain([NaN]));
});
