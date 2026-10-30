# Research-led project showcase

## Intent and selected approach

The owner approved prioritizing actual market and factor research and removing the generic tools. Replace the synthetic data-cleaning and rebalance examples with two interactive views of published aggregate research. Keep code/documentation links as a secondary project directory. Retain Astro, the site's bilingual catalogs and existing browser runtime; do not introduce a separate dashboard app or chart dependency.

Use the low-turnover market study and the Observatory's PB/ROE study. Both have publicly readable, reviewed aggregate assets and explicit methods/limitations. Do not use the factor demo dataset or reproduce private research. An iframe would duplicate navigation and impair mobile/language integration; copying result files into this repository would create a competing data copy. Instead read the owners' published assets directly in the browser, validating their schema before projection. Build/test remain offline-capable through synthetic contract fixtures. Complete study links remain usable without JavaScript or if a source is unavailable.

## Source and metric contract

- `https://runchengxie.github.io/quant-market-research/data/low_turnover_reader.json`: schema 1, percentage-point units, fixed formation support before forward-return filtering. Four controls, 86 formation months in the inspected 2026-10-30 version. Low/high values are gross monthly group returns represented in percent units; spread and 95% block-bootstrap endpoints are percentage points. Controls change group membership. Do not annualize, imply after-cost returns, infer causal effects or invent time-window selectors from aggregated data. Source hashes, sample dates, evidence/review dates remain inspectable.
- `https://runchengxie.github.io/quant-factor-observatory/data/research-studies.json`, study `pb-roe`: reviewed historical aggregate, retrospective diagnostic, same eligible pool, five named rankings. The PB comparison still requires computable ROE. Annualized return/excess return and drawdown magnitude are percent values; information ratio is a unitless ratio. Never label this untouched OOS or complete execution validation. Preserve statement revisions and approximate-execution limits.
- Both assets returned HTTP 200 and CORS `*` on 2026-10-30. Controlling definitions were checked in the public low-turnover methodology and the Observatory publication manifest. Local source revisions inspected: market `e0452314830442d23f7c9980dc780247aeb67fef`, Observatory `08deccbe1387dcb55491ac50de9b33f727c81dde`; the browser displays the actual published source dates and version identifiers it reads, rather than claiming a pinned production revision.

## Display and interaction

Put research before the repository catalog. Low turnover offers the four published control stages, shows low/high/spread with the spread's 95% interval and an exact-value table. PB/ROE offers four source metrics across five rankings with a zero-based signed bar scale and an exact-value table. Preserve original strategy order, not a best-performer ranking. State period, sample and evidence limitations beside the plots; detailed hashes and methods may be folded.

Use the existing neutral theme and one accent root, direct labels and a visible zero line; do not rely on color. Mobile charts stack without clipping and retain all category labels and exact values. Queries preserve the selected control/metric across language switching. Loading/failure states expose complete-study links and retry, never fabricated/default results. A failed refresh hides old values. Source data is projected through allowlisted fields and rendered with textContent. Timeout after six seconds; initialize panels independently.

## Implementation and verification

- Delete the retired tools' component, browser/calculation modules, tests, CSS and locale keys; archive their design record.
- Add bounded runtime validators/projections for the two published assets plus unit tests for unit/schema drift, nonfinite values, duplicates, unsupported evidence stages and numeric consistency.
- Add one reusable research component and browser controller; keep translatable UI and explanations in locale catalogs.
- Update browser regressions with deterministic synthetic source fixtures. Verify actual public payloads separately with these same parsers and an unmocked source smoke test. Cover successful filtering, distinct units, source failure/retry, language/query persistence, no-script links, both themes and narrow layouts.
- Run `script/check`, browser suite and an independent review. Validate the final merged version through GitHub CI, verify production, and clean up only this task's resources.

## Validation record

Validated against website baseline `f582d2c0a92eb2815b458fd0f0a6b35df09494ba`. `script/check` passed Astro/type checks, the 63-page build, 17 legacy redirects, internal links and all four test files. Browser regression passed 112 locale/viewport/theme combinations and 30 articles, including research filtering, source failures/retry, language/query persistence and no-script links. An unmocked browser smoke test loaded both published sources in English/Chinese at 390/1440px, checked actual values and both selectors, and found no overflow or JavaScript errors. Screenshots were inspected outside the repository.

Independent review requested an explicit PB/ROE column-order contract so upstream header changes cannot silently relabel metrics. Added that check and missing/reordered-column regressions; confirmed the actual published payload still validates. Review otherwise approved the source, units, failure handling and accessibility approach. GitHub CI and production deployment are verified separately against the final commit.
