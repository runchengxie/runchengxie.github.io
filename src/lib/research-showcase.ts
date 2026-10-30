export const researchSources = {
  market: "https://runchengxie.github.io/quant-market-research/data/style-factors/reader.json",
  factor: "https://runchengxie.github.io/quant-factor-observatory/data/research-studies.json",
} as const;
export const styleIds = ["size", "value", "momentum", "quality", "earnings_yield", "lowvol", "growth", "leverage", "beta", "liquidity", "liquidity_flow", "chip_concentration", "institution_holding", "fund_breadth", "fund_breadth_change", "fund_ownership", "fund_ownership_change", "dividend_yield", "ps_value"] as const;
export type StyleId = typeof styleIds[number];
export const factorIds = ["pb", "staticRoe", "changeRoe", "adjustedPb", "adjustedChange"] as const;
export const metricIds = ["annualReturn", "excessReturn", "drawdown", "informationRatio"] as const;
export type MetricId = typeof metricIds[number];
export interface AnnualRow {year:number; periodStart:string; periodEnd:string; days:number; partial:boolean; value:number;}
export interface MarketEvidence {coverageStart:string;coverageEnd:string;sourceHashes:{summary:string;yearly:string};factors:{id:StyleId;annual:AnnualRow[]}[];}
export interface FactorRow { id: typeof factorIds[number]; annualReturn: number; excessReturn: number; drawdown: number; informationRatio: number; }
export interface FactorEvidence { updatedAt: string; checkedAt: string; start: string; end: string; rows: FactorRow[]; }
function fail(): never { throw new Error("Unsupported public research asset"); }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail();
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] { return Array.isArray(value) ? value : fail(); }
function finite(value: unknown): number { return typeof value === "number" && Number.isFinite(value) ? value : fail(); }
function date(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fail();
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value ? value : fail();
}
function hash(value: unknown): string { return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) ? value : fail(); }
export function parseMarketEvidence(value: unknown): MarketEvidence {
  const input=record(value);
  if(input.schemaVersion!==1 || input.unit!=="percent" || input.evidenceStage!=="historical_archive") fail();
  const coverageStart=date(input.coverageStart),coverageEnd=date(input.coverageEnd);
  if(coverageStart>coverageEnd) fail();
  const hashes=record(input.sourceHashes);
  const factors=list(input.factors).map(item=>{
    const factor=record(item);
    if(!styleIds.includes(factor.id as StyleId)) fail();
    const annual=list(factor.annual).map(item=>{
      const row=record(item),year=finite(row.year),days=finite(row.days),value=finite(row.value);
      const periodStart=date(row.periodStart),periodEnd=date(row.periodEnd);
      if(!Number.isInteger(year)||!Number.isInteger(days)||days<=0||days>366||value < -100||typeof row.partial!=="boolean"||periodStart>periodEnd||periodStart<coverageStart||periodEnd>coverageEnd||!periodStart.startsWith(`${year}-`)||!periodEnd.startsWith(`${year}-`)) fail();
      return {year,periodStart,periodEnd,days,partial:row.partial,value};
    });
    if(!annual.length||new Set(annual.map(row=>row.year)).size!==annual.length) fail();
    return {id:factor.id as StyleId,annual:annual.sort((a,b)=>a.year-b.year)};
  });
  if(factors.length!==styleIds.length||new Set(factors.map(row=>row.id)).size!==styleIds.length) fail();
  return {coverageStart,coverageEnd,sourceHashes:{summary:hash(hashes.summary),yearly:hash(hashes.yearly)},factors:styleIds.map(id=>factors.find(row=>row.id===id)!)};
}
const rowNames = ["仅用 PB", "PB + 静态 ROE", "PB + ROE 变化", "质量调整后的 PB", "质量调整 PB + ROE 变化"] as const;
function decimal(value: unknown, percentage: boolean): number {
  if (typeof value !== "string" || !(percentage?/^[+-]?\d+(?:\.\d+)?%$/:/^[+-]?\d+(?:\.\d+)?$/).test(value)) return fail();
  return finite(Number(percentage?value.slice(0,-1):value)) / (percentage?100:1);
}
export function parseFactorEvidence(value: unknown): FactorEvidence {
  const input = record(value);
  if (input.schema_version !== 1) fail();
  const candidates = list(input.studies).map(record).filter(study=>study.id === "pb-roe");
  if (candidates.length !== 1) fail();
  const study = candidates[0]!;
  if (study.status !== "historical-reviewed" || study.evidence_stage !== "retrospective_diagnostic") fail();
  const review = record(study.source_review_status);
  if (review.status !== "matched" || typeof review.checked_at !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(review.checked_at) || !Number.isFinite(Date.parse(review.checked_at))) fail();
  const period = typeof study.period === "string" ? study.period.match(/\d{4}-\d{2}-\d{2}/g) : null;
  if (!period || period.length !== 2) fail();
  const start=date(period[0]),end=date(period[1]); if(start>end) fail();
  const expectedColumns = ["排序", "年化收益", "年化超额", "最大回撤", "信息比率"];
  const columns = list(study.columns);
  if (columns.length !== expectedColumns.length || columns.some((column,index)=>column !== expectedColumns[index])) fail();
  const rows = list(study.rows).map(item => {
    const row = list(item);
    const index = rowNames.indexOf(row[0] as typeof rowNames[number]);
    if (row.length !== 5 || index < 0) fail();
    const annualReturn=decimal(row[1],true),excessReturn=decimal(row[2],true),drawdown=decimal(row[3],true),informationRatio=decimal(row[4],false);
    if (drawdown<0 || drawdown>1 || annualReturn < -1) fail();
    return {id:factorIds[index]!,annualReturn,excessReturn,drawdown,informationRatio};
  });
  if(rows.length!==5 || new Set(rows.map(row=>row.id)).size!==5) fail();
  return {updatedAt:date(input.updated_at),checkedAt:review.checked_at,start,end,rows:factorIds.map(id=>rows.find(row=>row.id===id)!)};
}
export function chartDomain(values: readonly number[]): [number,number] {
  if (!values.length || values.some(value=>!Number.isFinite(value))) fail();
  const minimum=Math.min(0,...values),maximum=Math.max(0,...values);
  return minimum===maximum?[0,1]:[minimum,maximum];
}
