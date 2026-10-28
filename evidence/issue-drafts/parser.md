**Current resolution — FIXED (5 October 2026).** The desk reports `fix(dates): parse dd/mm for eu locales`. GitHub issue #1 is closed as completed. This desk update postdates the export; the counts below remain historical. Source: https://hq.mega.dev/challenges/what-it-shows

## Problem
The shared parser interprets numeric dates as month/day even for day-first tenants. Calendar invites and reminders can swap the intended day and month. This is the parser defect represented by the majority of source ticket **#4471**, not the booking-v3 hint defect tracked separately.

## Reports covered
**379 distinct reports**, across **11 tenants**, received **2026-04-01 through 2026-10-04**. The export has 427 rows and 412 unique report IDs; 15 repeated rows come from overlapping export pages. Deduplicate by `id`, filter `mergedInto === 4471`, then classify with the supplied `causeOf(report, tenantOf(report))`. The other **33** reports are the separate hint cause. The two counts sum to 412 without double counting.

Intake tags are guesses: these 379 include 356 tagged `parser` and 23 tagged `hint`. Browser locale is not a substitute for tenant configuration.

## Evidence and reproduction
- `R-41200`, Harbour Dental (`en-GB`), app: 7 April became 4 July.
- `R-41203`, Lantern Row (`cs-CZ`), app: 2 December became 12 February.
- Reproduce with a day-first tenant and the app/email intake path (or booking-v2 form): submit `07/04/2026` meaning 7 April and inspect the outgoing calendar date.
- Expected: 7 April remains 7 April. Reported behavior: 4 July.
- Source: `src/lib/kb/causes.ts`, `src/lib/kb/locales.ts`, tenant directory, and `src/lib/data/reports-4471.json`.

## Scope and uncertainty
`R-41202`, `R-41209`, `R-41236`, `R-41344`, and `R-41620` describe one-day shifts, an invite before booking, or differing dates across cities. The supplied classifier files all five under parser and `desk-notes.json` singles them out. They remain included in 379, with an explicit caveat: a day/month swap alone does not explain these bodies. Preserve their evidence and investigate separately; do not assert a confirmed timezone defect or silently subtract them.

## Proposed fix and acceptance checks
- Parse according to the tenant's explicit date contract; keep date-only values distinct from instants and reject ambiguous input instead of silently swapping it.
- Test day-first tenants, app/email and booking-v2 form paths, unambiguous dates, invalid dates, and month/day ambiguity.
- Verify the hint ticket independently: fixing this parser does not fix the booking-v3 form's misleading label.
- Stop merging by subject alone. Compare tenant configuration, channel, mechanism, and body; retain unplaced/contradictory reports for review.

## Reproducible audit
Run `npm run analyse` and `npm test`. `evidence/analysis.json` lists every covered report ID. Signed KB review: `src/routes/kb/incidents/4471-review/+page.svx`; rendered page: `rendered/kb/incidents/4471-review/index.html`.
