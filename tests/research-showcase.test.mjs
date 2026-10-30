import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {marketFixture,factorFixture} from './research-showcase-fixtures.mjs';
const load=async()=>{assert.ok(existsSync('src/lib/research-showcase.ts'),'Research-source parser is not implemented');return import('../src/lib/research-showcase.ts');};
test('projects historical style years without changing percent units or filling absent years',async()=>{
 const {parseMarketEvidence}=await load();const input=marketFixture();input.private_detail='excluded';
 const data=parseMarketEvidence(input);assert.equal(data.factors.length,19);assert.equal(data.factors[0].annual[0].value,-20);assert.equal(data.factors[0].annual[0].partial,true);assert.deepEqual(data.factors[0].annual.map(row=>row.year),[2008,2010,2026]);assert.equal('private_detail' in data,false);
});
test('rejects style schema/unit/stage drift, duplicates and inconsistent yearly coverage',async()=>{
 const {parseMarketEvidence}=await load();
 for(const mutate of [x=>x.unit='fraction',x=>x.evidenceStage='validated',x=>x.schemaVersion=2,x=>x.factors[0].annual[0].value=NaN,x=>x.factors[0].annual[0].value=-101,x=>x.factors[1].id='size',x=>x.factors[0].annual[1].year=2008,x=>x.factors[0].annual[0].periodStart='2008-02-30',x=>x.factors[0].annual[0].partial='true',x=>x.factors[0].annual[0].days=0,x=>x.sourceHashes.summary='invalid',x=>x.coverageEnd='2000-01-01',x=>x.factors[0].annual=[],x=>x.factors.pop()]){
  const input=marketFixture();mutate(input);assert.throws(()=>parseMarketEvidence(input));
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
