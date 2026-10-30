// Synthetic contract fixtures only. Production reads the owners' published assets.
export const marketFixture=()=>({schemaVersion:1,unit:'percentage_points',rankingMode:'formation_signal_support_fixed_before_forward_return_filter',evidenceDate:'2026-09-16',reviewedAt:'2026-10-22',formationStart:'2019-05-31',formationEnd:'2026-06-30',firstReturnEnd:'2019-06-28',lastReturnEnd:'2026-07-31',months:86,manifestSha256:'a'.repeat(64),summarySha256:'b'.repeat(64),monthlySha256:'c'.repeat(64),controls:[
 {id:'raw',low:1.2,high:.2,spread:1,ciLow:.5,ciHigh:1.5},
 {id:'size',low:1.4,high:-.2,spread:1.6,ciLow:1.1,ciHigh:2.1},
 {id:'size_lowvol',low:.6,high:-.2,spread:.8,ciLow:.3,ciHigh:1.2},
 {id:'plus_beta_value',low:.8,high:-.3,spread:1.1,ciLow:.6,ciHigh:1.7}]});
export const factorFixture=()=>({schema_version:1,updated_at:'2026-10-23',studies:[{id:'pb-roe',status:'historical-reviewed',evidence_stage:'retrospective_diagnostic',period:'2010-01-29 至 2026-08-31',columns:['排序','年化收益','年化超额','最大回撤','信息比率'],source_review_status:{status:'matched',checked_at:'2026-10-14T10:05:57+00:00'},rows:[
 ['仅用 PB','10%','5%','40%','0.5'],['PB + 静态 ROE','8%','3%','38%','0.3'],['PB + ROE 变化','9%','4%','41%','0.4'],['质量调整后的 PB','10%','5%','42%','0.6'],['质量调整 PB + ROE 变化','9%','4%','41%','0.5']]}]});
