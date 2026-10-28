**Current resolution — WON'T FIX (5 October 2026).** The desk reports booking-v3 form retired. GitHub issue #2 is closed as not planned, not as a delivered hint fix. This supersedes the initial completed closure; the counts below remain historical. Source: https://hq.mega.dev/challenges/what-it-shows

## Problem
The **booking-v3** date field prints **MM/DD/YYYY** for day-first tenants, but interprets form input using the tenant's day-first convention. Following the hint swaps month and day. This is a different defect from the shared parser tracked in source ticket #4471 and needs its own fix.

## Reports covered
**33 distinct reports**, across **3 tenants** (Alder Physio `de-DE`, Copper Studio `es-ES`, Pale Harbour `pt-PT`), received **2026-04-17 through 2026-09-22**. Deduplicate export rows by report `id`, filter `mergedInto === 4471`, join the tenant directory, then select `causeOf(...) === 'hint'`: day-first tenant, `booking-v3`, and `channel === 'form'`.

Intake tagged 18 of these as `hint` and 15 as `parser`. The source ticket also contains **379** parser-cause reports; 379 + 33 = **412** unique reports, not 427 export rows. Tenant locale and form, not browser locale, determine the cause.

## Evidence and reproduction
- The supplied `DATE_HINT` in `src/lib/kb/causes.ts` maps booking-v3 to `MM/DD/YYYY`, while `causeOf` detects the mismatch for day-first form reports.
- `R-41572`, Copper Studio, form: agreed 7 May, invite says 5 July; browser `en-US`, tenant `es-ES`. The browser setting cannot identify the tenant's actual date contract.
- `R-41582`, Pale Harbour, form: 7 March reminder became 3 July; intake incorrectly tagged it `parser`.
- Reproduce on a day-first booking-v3 tenant: follow `MM/DD/YYYY` to enter `05/07/2026` for 7 May. The form reads day-first and produces 5 July.
- Expected: the displayed hint, accepted format, and stored date agree for the tenant.

## Proposed fix and acceptance checks
- Generate the displayed hint and validation rules from the same tenant-specific date contract used by the form; do not change the hint alone while leaving validation inconsistent.
- Cover all three affected tenants, day/month ambiguity and unambiguous dates, booking-v2 regression checks, and app/email paths.
- Keep this ticket separate from the shared parser. A parser-only fix leaves the misleading booking-v3 hint in place.
- Deduplicate by cause and evidence, never matching subject alone: an Alder Physio form and app report with the same subject have different causes, while app/email reports from the same booking-v2 tenant can share one cause despite different subjects.

## Reproducible audit
Run `npm run analyse` and `npm test`. `evidence/analysis.json` lists every covered report ID. Signed KB review: `src/routes/kb/incidents/4471-review/+page.svx`; rendered page: `rendered/kb/incidents/4471-review/index.html`.

## KB handoff

- [Signed KB page source (.svx)](https://github.com/keyroll-99/mega-dev-s01e03/blob/main/kb.svx)
- [Rendered KB page (download and open HTML)](https://github.com/keyroll-99/mega-dev-s01e03/blob/main/kb.html)
- [Canonical KB route](https://github.com/keyroll-99/mega-dev-s01e03/blob/main/src/routes/kb/incidents/4471-review/%2Bpage.svx)
- [Report membership audit](https://github.com/keyroll-99/mega-dev-s01e03/blob/main/evidence/analysis.json)

The KB records both cause counts, the engineering update, the distinct closure reasons,
and the preserved uncertainty around the five unusual timing accounts.
