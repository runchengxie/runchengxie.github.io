# Article reference maintenance

The existing fifteen Chinese articles and their full English translations receive linked reference lists. Prefer original papers, author or publisher copies, Berkshire shareholder and partnership letters, company announcements, regulatory filings and institutional research. A source's presence is not evidence for every sentence in an article: indicate the relevant section, table or source passage and distinguish direct source facts from calculations, interpretations and later recollections.

## Conventions

- Put full author/institution, title, year and publication information in a final References / 参考文献 section, linking directly to a checked document or publication record.
- Add nearby links for precise figures, important quotations and any corrected attribution; keep external source destinations paired across English and Chinese versions.
- Preserve original source records when a link is corrected. Mark unavailable prior URLs as such; do not present a broken or unrelated URL as verified support.
- When evidence has a material limitation, put the limitation where the claim appears as well as in the source notes. Do not silently present an earlier working-paper result as a final-paper result.
- Correct bibliographic metadata and directly verified date, scope or quotation-context errors. Do not use an unverified secondary retelling as confirmation of exact historical figures.
- References support their named facts; the site's comparisons and interpretations remain the author's analysis.

## Verification

`script/check` now checks that every article has a linked reference list in both languages and that paired articles cite identical external URL sets, alongside existing translation, route and site checks. External source content is checked during research; local build checks do not establish that an external website will remain available.

Implementation baseline: website main `1730ea5090f5181d5383985d65162ea8530bdc3a`.

## Scope clarifications from this pass

Source checks were conducted on 2026-10-30. Article-level notes retain the evidence and its limits, including distinctions between the 2011 working paper and 2014 published governance study, after-tax earnings versus operating earnings at Sanborn, realized asset value versus market price at Dempster, and USAir dividends received in 1997. SEC holdings and reported market value are distinguished from the attribution of an investment decision. Older unavailable links remain in a folded source record.

Some early-case ownership/board/valuation details rely on named archival books or interview recollections rather than independently obtained original corporate records. The airline-loss range and a Tesco market-share sequence remain explicitly qualified where used. A published bibliography does not certify these as fully independently verified facts.

Validation: Astro diagnostics reported zero errors, warnings or hints; 63 pages and 17 compatibility redirects built; 80 HTML files and 869 local links passed. Reference-list and locale-source parity checks pass for all fifteen article pairs. The existing browser matrix and project-demo regression checks pass after the reference additions. Independent review identified an interpretation/attribution issue in the security-analysis article; it was corrected in both languages and the review finding closed.
