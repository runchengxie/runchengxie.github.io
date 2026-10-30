> Retired: the synthetic tool examples were removed in favor of the research showcase. See [the replacement design](../research-showcase.md).

# Interactive project examples

## Intent and approach

The owner requested one or two interactive project examples and asked for a recommendation. Implement market-data validation/cleaning and portfolio-rebalance calculations, with complete English/Chinese copy. Keep the site on Astro and calculate locally on editable synthetic examples. This pairs the data platform's input checks with the shared framework's portfolio calculations without requiring credentials, real data or a server.

Embedding full project runtimes would add deployment and data dependencies. A factor performance chart would need a reviewed research artifact and could obscure the difference between demonstration and evidence. Small input/output examples fit the visitor's next action: change a value and inspect what changes.

## Design

Place an interactive-example section on both project-directory pages, after the project relationship overview and before repository cards. Link each example to its owning project's documentation. Keep the existing catalog and navigation intact.

1. Data checks: an editable small table of date, synthetic symbol, closing price and volume. Check required values, real ISO dates, finite positive close, finite nonnegative volume, and repeated date/symbol keys. Show affected row/field and reason. Cleaning deletes incomplete/invalid rows and keeps the first valid record for each key; it never imputes prices. Include reset and an explicit rule list. No files are uploaded or market data fetched.
2. Rebalancing: three synthetic assets with editable current and target weights, portfolio value and fee in basis points. Require long-only weights in [0,100] and both weight sums equal 100, positive finite value <= 1e12 and fee in [0,1000]. Compute buys, sells, total traded amount, half-L1 turnover and fee charged on both buy and sell notional. Show per-asset signed changes. Keep costs explicitly pre-fee estimates; no cash/lot/slippage/tax simulation or return claims.

All translatable text lives in locale catalogs, including validation errors, labels and accessible names. Use locale-aware numbers and neutral IDs. Interactive controls activate only with JavaScript; explanatory text and default examples remain visible without it. Use textContent for input-derived content.

## Validation and implementation

- Pure TypeScript calculations under `src/lib/`, tested for duplicate/missing/invalid data, leap dates, valid-row cleaning, cost semantics, unchanged portfolios, full replacement, decimal weights, invalid sums, zero fees, and nonfinite/range errors.
- A reusable Astro component plus a browser module renders both examples; no UI framework or new dependency.
- Chromium checks editing, cleaning/reset, invalid portfolio inputs, changed fees/weights, language navigation, both themes and mobile/desktop overflow. Integrate with the existing browser test command.
- Run the complete repository `script/check` and browser checks before publishing. Record the final tested revision and remote checks in the PR.

## Source scope

Read the public data platform's minute-quality checks (duplicates, null/nonfinite values and negative flow) and the shared framework's `trade_accounting.py` (entry/exit amounts and half-L1 turnover). This is an explanatory example of selected rules, not an execution of the complete owner project or a claim of its full production validation coverage.

## Verification

Based on website main `04f9bf1f5e4885d774bf567523497f6693e9c722` after the descriptive-copy change merged. Six calculation tests pass; full Astro diagnostics have no errors/warnings/hints, 63 pages and 17 legacy redirects build, and 80 HTML files with 869 local links pass. Chromium covers the existing 112 locale/viewport/theme combinations and 30 articles, plus editing, cleaning, row creation/reset, invalid weights/fees, zero fees, stale-result clearing, markup-like inputs, and no-script default results. Inspected English/Chinese desktop/mobile screenshots and completed an independent calculation/UI review.
