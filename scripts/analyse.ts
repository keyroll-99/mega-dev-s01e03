import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { groupByCause, uniqueById, readAs, type Report, type Tenant } from '../src/lib/kb/causes.ts';
const base = fileURLToPath(new URL('../src/lib/data/', import.meta.url));
const raw: Report[] = JSON.parse(readFileSync(base + 'reports-4471.json', 'utf8'));
const tenants: Tenant[] = readdirSync(base + 'tenants').filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(base + 'tenants/' + f, 'utf8')));
const tenantOf = (r: Report) => tenants.find(t => t.handle === r.tenant);
const merged = uniqueById(raw).filter(r => r.mergedInto === 4471);
const notes = JSON.parse(readFileSync(base + 'desk-notes.json', 'utf8'));
const groups = groupByCause(merged, tenantOf).map(g => ({ cause: g.cause, count: g.reports.length, tenants: g.tenants, firstSeen: g.firstSeen, lastSeen: g.lastSeen, taggedAs: g.taggedAs, oneDayMove: readAs(g, notes.oneDayMove), ids: g.reports.map(r => r.id) }));
const receivedMonths: Record<string, number> = {};
const mergedMonths: Record<string, number> = {};
for (const r of merged) { receivedMonths[r.receivedAt.slice(0, 7)] = (receivedMonths[r.receivedAt.slice(0, 7)] ?? 0) + 1; if(r.mergedAt) mergedMonths[r.mergedAt.slice(0,7)] = (mergedMonths[r.mergedAt.slice(0,7)] ?? 0) + 1; }
const summary = { rawRows: raw.length, distinctReports: merged.length, duplicateRows: raw.length - uniqueById(raw).length, groups, receivedMonths, mergedMonths };
writeFileSync(fileURLToPath(new URL('../evidence/analysis.json', import.meta.url)), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
