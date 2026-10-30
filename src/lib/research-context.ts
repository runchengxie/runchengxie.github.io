import type {AnnualRow,FactorEvidence,MetricId} from './research-showcase';

// Editorial review date, separate from each source's observation and update dates.
export const interpretationReviewedAt = '2026-10-30';
export function summarizeStyle(rows:readonly AnnualRow[]) {
  if(!rows.length)throw new Error('Style interpretation requires observations');
  return {total:rows.length,positive:rows.filter(row=>row.value>0).length,negative:rows.filter(row=>row.value<0).length,zero:rows.filter(row=>row.value===0).length,latest:rows[rows.length-1]!,recent:rows.slice(-6)};
}
export function factorContrasts(evidence:FactorEvidence,metric:MetricId) {
  const baseline=evidence.rows.find(row=>row.id==='pb')![metric];
  return {staticDelta:evidence.rows.find(row=>row.id==='staticRoe')![metric]-baseline,adjustedDelta:evidence.rows.find(row=>row.id==='adjustedPb')![metric]-baseline};
}
