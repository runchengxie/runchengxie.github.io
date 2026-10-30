# Research-led project showcase

The projects page leads with two views of published research: **18-year A-share market style analysis** and PB/ROE ranking comparisons. It retains code/documentation links below the research. This revision replaces the earlier low-turnover preview; it does not rerun or revalidate the historical study.

## Market style source contract

Read `https://runchengxie.github.io/quant-market-research/data/style-factors/reader.json` at runtime, independently of the PB/ROE panel. The provider derives this neutral, versioned reader from its already-published historical factor summary and annual aggregates. No results are copied into this repository. Schema 1 requires `historical_archive` evidence, `percent` units, coverage dates, two SHA-256 file hashes and all 19 original factor IDs.

Each factor contains available yearly observations: calendar year, exact observed start/end dates, session count, a source partial-year flag and `period_return` in numeric percent units. A value of 10 means 10%, not a fraction. These are compounded within-period returns, not annualized returns. Do not fill missing years with zero, interpolate observations, or apply current factor formulas/sign conventions to the archived series. The historical generating scripts and formula correspondence are incompletely verified. These are synthetic long-short series, not account returns or untouched out-of-sample evidence. Financial point-in-time availability and tradability remain incomplete.

Select a factor to inspect its annual bars. Every plot includes zero and signed values; the scale is specific to the selected factor and explicitly disclosed. Partial years carry an asterisk. A folded exact-value table retains dates and session counts; file hashes and a complete-study link retain provenance. The selected factor's actual coverage is shown rather than implying 18 years for every factor. The study title describes the overall approximate research window, which spans portions of 2008–2026 and therefore can contain 19 calendar-year bins.

## PB/ROE source contract

Read `https://runchengxie.github.io/quant-factor-observatory/data/research-studies.json`, study `pb-roe`: schema 1, reviewed historical aggregate and retrospective diagnostic, same eligible pool, five named rankings and validated metric columns. The PB comparison still requires computable ROE. Annualized return/excess return and drawdown magnitude are percentages; information ratio is unitless. Keep the historical filing-revision and approximate-execution limits visible.

## Interaction and resilience

Reuse Astro, the locale catalogs and existing runtime; no chart dependency. Use bars, direct labels and a visible zero line, with the table available to assistive technologies. `researchStyle` and `researchMetric` query parameters retain selections across language switching. The retired `researchControl` parameter has no effect. English and Chinese share the same language-neutral data.

Panels validate and load independently with a six-second timeout. Failure hides results, disables the selector and offers retry; complete-study/source links remain available without JavaScript. Never display fabricated fallback results. Project only allowlisted fields and render text through textContent. The market reader is published by the provider before this consumer is merged.

## Verification

Synthetic contract fixtures cover all 19 factor IDs, negative returns, partial years and deliberately missing years. Unit checks reject schema/unit/evidence drift, duplicate factors/years, invalid dates/counts and hashes. Browser checks cover selector updates, independent source failure/retry, invalid query fallback, language/query preservation, themes, mobile layout and no-script navigation. Validate actual provider output with the same parser and check public sources after deployment. Build/test do not depend on live research services.

Local validation against website baseline `fcc51611081f806b995df52ef74e1dc603527f24`: full build/type/link checks and all unit files passed; browser suite passed 112 locale/viewport/theme combinations and 30 articles. Provider output from its actual archived aggregates passed the consumer validator (19 factors, size 19 calendar-year bins). Browser checks with that actual reader and the public PB/ROE asset passed English/Chinese at 390/1440px with no overflow or JavaScript errors; screenshots inspected. Independent consumer review found no material issues; corrected the minor annual-axis alignment it identified. Final public-source/deployment verification is recorded in the PR.
