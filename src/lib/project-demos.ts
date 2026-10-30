export const marketFields = ["date", "symbol", "close", "volume"] as const;
export type MarketField = typeof marketFields[number];
export type MarketRow = Record<MarketField, string>;
export type IssueCode = "required" | "date" | "price" | "volume" | "duplicate";
export interface DataIssue { row: number; field: MarketField; code: IssueCode; }

export const sampleMarketRows: MarketRow[] = [
  {date:"2026-10-12",symbol:"DEMO-A",close:"10",volume:"100"},
  {date:"2026-10-12",symbol:"DEMO-B",close:"",volume:"200"},
  {date:"2026-10-13",symbol:"DEMO-A",close:"10.2",volume:"120"},
  {date:"2026-10-13",symbol:"DEMO-A",close:"10.3",volume:"130"},
  {date:"2026-02-30",symbol:"DEMO-C",close:"-3",volume:"-20"},
];

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function rowIssues(row: MarketRow, index: number): DataIssue[] {
  const issues: DataIssue[] = [];
  const add = (field: MarketField, code: IssueCode) => issues.push({row:index+1,field,code});
  for (const field of marketFields) if (!row[field].trim()) add(field,"required");
  if (row.date.trim() && !validDate(row.date.trim())) add("date","date");
  if (row.close.trim() && (!Number.isFinite(Number(row.close)) || Number(row.close) <= 0)) add("close","price");
  if (row.volume.trim() && (!Number.isFinite(Number(row.volume)) || Number(row.volume) < 0)) add("volume","volume");
  return issues;
}

const rowKey = (row: MarketRow) => JSON.stringify([row.date.trim(),row.symbol.trim()]);
export function checkMarketRows(rows: readonly MarketRow[]) {
  const seen = new Set<string>();
  const issues = rows.flatMap((row,index) => {
    const found = rowIssues(row,index);
    if (validDate(row.date.trim()) && row.symbol.trim()) {
      const key = rowKey(row);
      if (seen.has(key)) found.push({row:index+1,field:"symbol",code:"duplicate"});
      seen.add(key);
    }
    return found;
  });
  const affected = new Set(issues.map(issue => issue.row));
  return {totalRows:rows.length,validRows:rows.length-affected.size,issues};
}

export function cleanMarketRows(rows: readonly MarketRow[]): MarketRow[] {
  const seen = new Set<string>();
  return rows.filter((row,index) => {
    if (rowIssues(row,index).length > 0) return false;
    const key = rowKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(row => Object.fromEntries(marketFields.map(field => [field,row[field].trim()])) as MarketRow);
}

export type RebalanceError = "weights" | "totals" | "value" | "fee";
export function calculateRebalance(current: readonly number[], target: readonly number[], value: number, feeBps: number) {
  const fail = (code: RebalanceError) => ({ok:false as const,code});
  if (current.length === 0 || current.length !== target.length || [...current,...target].some(w=>!Number.isFinite(w)||w<0||w>100)) return fail("weights");
  if (!Number.isFinite(value)||value<=0||value>1e12) return fail("value");
  if (!Number.isFinite(feeBps)||feeBps<0||feeBps>1000) return fail("fee");
  const sum = (weights:readonly number[]) => weights.reduce((total,w)=>total+w,0);
  if (Math.abs(sum(current)-100)>1e-6 || Math.abs(sum(target)-100)>1e-6) return fail("totals");
  const deltas = current.map((weight,i) => (target[i]! - weight)/100);
  const buys = deltas.reduce((total,d)=>total+Math.max(0,d),0);
  const sells = deltas.reduce((total,d)=>total+Math.max(0,-d),0);
  return {ok:true as const, buyAmount:buys*value, sellAmount:sells*value,
    tradedAmount:(buys+sells)*value, turnover:(buys+sells)/2,
    fee:(buys+sells)*value*feeBps/10000, trades:deltas.map(d=>d*value)};
}
