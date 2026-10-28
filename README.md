# S01E03 delivery · what it shows

- **Signed KB source:** [kb.svx](kb.svx)
- **Page as the desk sees it, standalone HTML:** [kb.html](kb.html)
- [Canonical KB route source](src/routes/kb/incidents/4471-review/+page.svx)
- [Interactive rendered site](rendered/kb/incidents/4471-review/index.html)
- [Parser · 379 reports · fixed](https://github.com/keyroll-99/mega-dev-s01e03/issues/1)
- [Hint · 33 reports · won't fix, form retired](https://github.com/keyroll-99/mega-dev-s01e03/issues/2)

`kb.svx` is generated from the canonical route source. `kb.html` is the actual server-rendered
page with its generated CSS inlined, so it can be downloaded and opened directly. Its controls
are static; serve `rendered/` over HTTP for the interactive version. Regenerate both with
`node scripts/export-delivery.mjs` after `npm run build`.

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review (28 October 2026)

- Public repository: https://github.com/keyroll-99/mega-dev-s01e03
- Parser issue: https://github.com/keyroll-99/mega-dev-s01e03/issues/1
- Hint issue: https://github.com/keyroll-99/mega-dev-s01e03/issues/2
- New signed page: `src/routes/kb/incidents/4471-review/+page.svx`
- Rendered page: `rendered/kb/incidents/4471-review/index.html`
- Computed report membership: `evidence/analysis.json`
- New decision 0002 replaces the triage rule. Accepted decision 0001 remains unchanged.

The source snapshot has 427 rows / 412 unique report IDs: 379 parser and 33 hint.
Five unexplained timing accounts stay included under parser, explicitly flagged for follow-up.
The later engineering update on the Challenge page says #4471 closed on 5 October 2026:
parser FIXED (`fix(dates): parse dd/mm for eu locales`); hint WON'T FIX (booking-v3 retired).
Issue #1 is closed as completed. Issue #2 is closed as not planned, not as a delivered fix.
The rendered summary, table, timeline, explorer and signature reference use the supplied logic
at build/render time; they are not hand-copied numbers.

### Run and rebuild

Requires Node.js 22.18+ (native TypeScript stripping) or Node.js 24.

```sh
npm ci
npm run analyse
npm test
npm run build
# Publish a new rendered snapshot after verifying it:
cp -R build/. rendered/
npm run preview -- --port 4173
```

Open `/kb/incidents/4471-review/` in the preview. To inspect the committed rendering,
run `python3 -m http.server 4174 --directory rendered` and open the same path.
Serve the directory over HTTP: the generated asset and route URLs are root-relative.
No paid services, account creation or external production changes are needed.
