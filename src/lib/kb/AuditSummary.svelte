<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, groupByCause, causeOf, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  const merged = $derived(uniqueById(reports as Report[]).filter(r => r.mergedInto === 4471));
  const groups = $derived(groupByCause(merged, tenantOf));
  const drift = $derived(merged.filter(r => causeOf(r, tenantOf(r)) !== r.meta.intakeTag).length);
  const dates = $derived(merged.map(r => r.receivedAt.slice(0,10)).sort());
  const links: Record<string, string> = {
    parser: 'https://github.com/keyroll-99/mega-dev-s01e03/issues/1',
    hint: 'https://github.com/keyroll-99/mega-dev-s01e03/issues/2'
  };
</script>
<p><strong>{reports.length}</strong> export rows → <strong>{merged.length}</strong> distinct reports in #4471.
{reports.length - uniqueById(reports as Report[]).length} repeated rows are overlapping export pages, not extra reports.
Received {dates[0]} through {dates.at(-1)}. Intake tags disagree with tenant-based classification for <strong>{drift}</strong> reports.</p>
<table>
  <thead><tr><th>Separate engineering ticket</th><th>Distinct reports</th><th>Scope</th></tr></thead>
  <tbody>{#each groups as g (g.cause)}
    <tr><td>{#if links[g.cause]}<a href={links[g.cause]}>{g.cause}</a>{:else}{g.cause} — needs triage{/if}</td><td>{g.reports.length}</td><td>{g.tenants} tenants · {g.firstSeen} → {g.lastSeen}</td></tr>
  {/each}</tbody>
</table>
