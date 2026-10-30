# Market style showcase implementation plan

Goal: replace the low-turnover preview with the approved neutral 18-year A-share market style analysis, retaining the PB/ROE comparison. Consume the research project's canonical public reader; publish the provider before this consumer.

Architecture: preserve Astro and locale catalogs. A validated schema-1 historical archive contains 19 factor IDs and year-level period returns in percent units. Select a factor, display its available years with signed zero-based bars, exact dates/day counts/partial flags in a folded table, visible source limits and source hashes. Missing years remain absent. These are historical synthetic long-short returns, not account returns; do not infer current formula/PIT validation from renaming.

- [x] Add fixture/validator regressions for schema/unit/stage, factor IDs, yearly dates, duplicates, missing years and numerical units.
- [x] Replace retired low-turnover data model/controller/catalog entries with the style selector, annual bars, coverage and exact values. Preserve the separate PB/ROE selector and error handling.
- [x] Update browser regressions for factor selection, source failure/retry, locale/query persistence, old query fallback, accessibility and mobile themes.
- [ ] Validate build, browser and actual provider payload; independent review; commit and PR.
- [ ] After provider publication, merge checked consumer, verify Pages production, clean task resources.

Naming migration is a descriptive presentation change, not a legal clearance or a claim of new numerical verification. Original source references and compatibility routes belong to the provider.
