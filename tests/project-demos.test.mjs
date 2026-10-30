import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const load = async()=>{
 assert.ok(existsSync('src/lib/project-demos.ts'),'Project demo calculations are not implemented');
 return import('../src/lib/project-demos.ts');
};
const row=(date='2026-10-12',symbol='DEMO-A',close='10',volume='100')=>({date,symbol,close,volume});
test('checks missing/invalid values, calendar dates and repeated keys',async()=>{
 const {checkMarketRows}=await load();
 const result=checkMarketRows([row(),row(),row('2026-02-30','DEMO-B','-1','-3'),row('','','',''),row('2024-02-29','DEMO-C')]);
 assert.equal(result.totalRows,5);
 assert.equal(result.validRows,2);
 assert.ok(result.issues.some(i=>i.row===2&&i.code==='duplicate'));
 assert.ok(result.issues.some(i=>i.row===3&&i.code==='date'));
 assert.ok(result.issues.some(i=>i.row===3&&i.code==='price'));
 assert.ok(result.issues.some(i=>i.row===3&&i.code==='volume'));
 assert.equal(result.issues.filter(i=>i.row===4&&i.code==='required').length,4);
});
test('cleaning keeps the first valid duplicate, never fills missing values',async()=>{
 const {cleanMarketRows,checkMarketRows}=await load();
 const cleaned=cleanMarketRows([row('2026-10-12','DEMO-A','','100'),row(),row('2026-10-12','DEMO-A','11'),row('2026-10-13','DEMO-B','12','0')]);
 assert.deepEqual(cleaned,[row(),row('2026-10-13','DEMO-B','12','0')]);
 assert.equal(checkMarketRows(cleaned).issues.length,0);
 assert.deepEqual(cleanMarketRows([]),[]);
});
test('rejects nonfinite numbers and whitespace-only fields',async()=>{
 const {checkMarketRows}=await load();
 for(const close of ['Infinity','NaN','1e400','0','-1','junk']) assert.ok(checkMarketRows([row('2026-10-12','DEMO-A',close)]).issues.some(i=>i.field==='close'));
 assert.ok(checkMarketRows([row('2026-10-12',' ','10','100')]).issues.some(i=>i.field==='symbol'&&i.code==='required'));
 assert.equal(checkMarketRows([row('2026-10-12','DEMO-A','1e1','0')]).issues.length,0);
});
test('calculates half-L1 turnover and fees on both buys and sells',async()=>{
 const {calculateRebalance}=await load();
 const result=calculateRebalance([50,30,20],[30,40,30],100000,10);
 assert.equal(result.ok,true);
 assert.equal(result.buyAmount,20000);
 assert.equal(result.sellAmount,20000);
 assert.equal(result.tradedAmount,40000);
 assert.equal(result.turnover,.2);
 assert.equal(result.fee,40);
 assert.deepEqual(result.trades,[-20000,10000,10000]);
});
test('handles unchanged weights, full replacement, zero fees and decimal weights',async()=>{
 const {calculateRebalance}=await load();
 const same=calculateRebalance([50,30,20],[50,30,20],100000,10);
 assert.equal(same.ok,true);assert.equal(same.fee,0);assert.equal(same.turnover,0);
 const full=calculateRebalance([100,0,0],[0,100,0],100000,10);
 assert.equal(full.tradedAmount,200000);assert.equal(full.turnover,1);assert.equal(full.fee,200);
 assert.equal(calculateRebalance([50,30,20],[30,40,30],100000,0).fee,0);
 assert.equal(calculateRebalance([33.3,33.3,33.4],[33.3,33.3,33.4],123.45,1).ok,true);
});
test('rejects invalid sums, ranges, empty portfolios and nonfinite inputs',async()=>{
 const {calculateRebalance}=await load();
 for(const args of [
  [[50,30,20],[30,40,20],100000,10],[[101,-1,0],[30,40,30],100000,10],
  [[50,30,20],[30,40,30],0,10],[[50,30,20],[30,40,30],Infinity,10],
  [[50,30,20],[30,40,30],1e13,10],[[50,30,20],[30,40,30],100000,-1],
  [[50,30,20],[30,40,30],100000,1001],[[50,30,20],[30,40,30],100000,NaN],
  [[],[],100,10],[[100],[50,50],100,10],[[NaN,0,100],[30,40,30],100,1],
 ]) assert.equal(calculateRebalance(...args).ok,false,JSON.stringify(args));
});
