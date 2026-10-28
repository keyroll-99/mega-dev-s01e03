import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { causeOf, dayFirst, groupByCause, uniqueById, sameCause, readAs, type Report, type Tenant } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';
import { daysSince } from '../src/lib/kb/staleness.ts';
const data = new URL('../src/lib/data/', import.meta.url);
const raw: Report[] = JSON.parse(readFileSync(new URL('reports-4471.json', data), 'utf8'));
const tenants: Tenant[] = readdirSync(new URL('tenants/', data)).map(f => JSON.parse(readFileSync(new URL('tenants/' + f, data), 'utf8')));
const tenantOf = (r: {tenant: string}) => tenants.find(t => t.handle === r.tenant);
const unique = uniqueById(raw).filter(r => r.mergedInto === 4471);
const groups = groupByCause(unique, tenantOf);
test('overlapping export pages count each report ID once', () => {
  assert.equal(raw.length, 427); assert.equal(unique.length, 412);
  assert.equal(groups.reduce((n, g) => n + g.reports.length, 0), 412);
  assert.deepEqual(Object.fromEntries(groups.map(g => [g.cause, g.reports.length])), { parser: 379, hint: 33 });
});
test('tenant form and channel, not intake tags, identify the cause', () => {
  const alder = tenantOf({ tenant: 'alder.physio' });
  assert.equal(causeOf({ channel: 'form' }, alder), 'hint');
  assert.equal(causeOf({ channel: 'app' }, alder), 'parser');
  const kettle = tenantOf({ tenant: 'kettle.books' });
  assert.equal(causeOf({ channel: 'form' }, kettle), 'parser');
  assert.equal(sameCause({channel:'form'}, alder, {channel:'form'}, kettle), false);
  assert.equal(sameCause({channel:'app'}, kettle, {channel:'email'}, kettle), true);
  assert.equal(sameCause({channel:'app'}, undefined, {channel:'app'}, undefined), false);
  assert.equal(dayFirst('en-US'), false); assert.equal(dayFirst('pl-PL'), true);
});
test('intake guesses disagree with 38 reports and are not ground truth', () => {
  assert.equal(unique.filter(r => causeOf(r, tenantOf(r)) !== r.meta.intakeTag).length, 38);
});
test('five unusual timing accounts stay footnoted in parser, not silently discarded', () => {
  const notes = JSON.parse(readFileSync(new URL('desk-notes.json', data), 'utf8'));
  assert.equal(readAs(groups.find(g => g.cause === 'parser')!, notes.oneDayMove), 5);
  assert.equal(readAs(groups.find(g => g.cause === 'hint')!, notes.oneDayMove), 0);
});
test('re-evaluation follows tenant configuration changes', () => {
  const alder = tenantOf({tenant:'alder.physio'})!;
  assert.equal(causeOf({channel:'form'}, {...alder, form:'booking-v2'}), 'parser');
  assert.equal(causeOf({channel:'form'}, {...alder, locale:'en-US'}), null);
});
test('signature is computed and old accepted decision is stale', () => {
  assert.match(deskRef('keyroll-99 / Codex'), /^DR-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  assert.equal(deskRef('keyroll-99 / Codex'), deskRef('  keyroll-99 / Codex  '));
  assert.ok(daysSince('2024-06-11', new Date('2026-10-28T12:00:00Z')) > 180);
});
test('review uses the actual course-issued signing proof, not an author label', () => {
  const source = readFileSync(new URL('../src/routes/kb/incidents/4471-review/+page.svx', import.meta.url), 'utf8');
  const signature = source.match(/^signature: '([^']+)'$/m)?.[1];
  assert.ok(signature?.startsWith('v1.'));
  const payload = JSON.parse(Buffer.from(signature!.split('.')[1], 'base64url').toString());
  assert.equal(payload.aud, 'challenge:what-it-shows');
  assert.ok(source.trimEnd().endsWith('<RenderStamp {signature} />'));
});
