import {test} from 'node:test';
import assert from 'node:assert/strict';
import {marketFixture,factorFixture} from './research-showcase-fixtures.mjs';
import {parseMarketEvidence,parseFactorEvidence} from '../src/lib/research-showcase.ts';
test('style interpretation covers all available periods while the preview stays short',async()=>{
 const {summarizeStyle}=await import('../src/lib/research-context.ts');
 const rows=parseMarketEvidence(marketFixture()).factors[0].annual;
 const summary=summarizeStyle(rows);assert.equal(summary.positive,2);assert.equal(summary.negative,1);assert.equal(summary.total,3);assert.equal(summary.latest.year,2026);
 const long=Array.from({length:19},(_,i)=>({...rows[0],year:2008+i,value:i===0?0:i-5}));
 const data=summarizeStyle(long);assert.equal(data.recent.length,6);assert.equal(data.recent[0].year,2021);assert.equal(data.total,19);assert.equal(data.positive,13);assert.equal(data.negative,4);assert.equal(data.zero,2);
});
test('PB/ROE interpretation reports signed differences with the metric native units',async()=>{
 const {factorContrasts}=await import('../src/lib/research-context.ts');const evidence=parseFactorEvidence(factorFixture());
 const returns=factorContrasts(evidence,'annualReturn');assert(Math.abs(returns.staticDelta+.02)<1e-10);assert.equal(returns.adjustedDelta,0);
 const ratio=factorContrasts(evidence,'informationRatio');assert(Math.abs(ratio.staticDelta+.2)<1e-10);assert(Math.abs(ratio.adjustedDelta-.1)<1e-10);
});
